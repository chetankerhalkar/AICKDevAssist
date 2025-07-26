import * as vscode from 'vscode';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import TelemetryReporter from '@vscode/extension-telemetry';
import weaviate, { ApiKey } from 'weaviate-ts-client';
import sql from 'mssql';
import * as WebSocket from 'ws';
import { exec } from 'child_process';
import * as jsdiff from 'diff';
import { runLangGraphAgent } from '../src/agents/langgraphAgent';
import { generateReadmeAgent } from "../src/agents/generateReadmeAgent";
import { createPullRequestAgent } from "../src/agents/createPullRequestAgent";
import { getLLMConfig, getADAuthConfig, LLMConfig } from '../src/config';
import { getLLM } from '../src/llm';
import { AICKStudioAIConfigurationProvider } from '../src/configurationProvider';
import { AzureADAuthenticator, getAuthenticationStatus } from '../src/adAuth';
import * as os from 'os';

dotenv.config();

// Global variables for backward compatibility
let authToken: string | null = null;
let telemetryReporter: TelemetryReporter | undefined;
const adConfig = getADAuthConfig();
function isAuthenticationRequired(): boolean {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    return config.get<boolean>('adAuth.enabled', true);
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('AICKStudio AI extension is now active!');

    initializeTelemetry();

    const configProvider = AICKStudioAIConfigurationProvider.getInstance();

    // FIXED: Register all commands FIRST before any configuration checks
    // This ensures commands are available when needed during activation
    
    // Register authentication command
    const authenticateCommand = vscode.commands.registerCommand('AICKStudioAI.authenticate', async () => {
        const adConfig = getADAuthConfig();
        if (!adConfig) {
            vscode.window.showErrorMessage('Azure AD configuration not found. Please configure your AD settings first.');
            await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
            return;
        }

        const authenticator = AzureADAuthenticator.getInstance();
        const result = await authenticator.authenticate(adConfig);
        
        if (result.success) {
            vscode.window.showInformationMessage(`Successfully authenticated as ${result.userInfo?.displayName || 'User'}`);
            telemetryReporter?.sendTelemetryEvent('authentication', { status: 'success' });
        } else {
            vscode.window.showErrorMessage(`Authentication failed: ${result.error}`);
            telemetryReporter?.sendTelemetryEvent('authentication', { status: 'failed', error: result.error || 'unknown' });
        }
    });

    // Register configuration command
    const configureCommand = vscode.commands.registerCommand('AICKStudioAI.configureSettingsDevFix', async () => {
        console.log('[AICKStudio AI] configureSettings command handler invoked');
        try {
            await configProvider.openConfigurationUI(context);
        } catch (error) {
            console.error('[AICKStudio AI] Error opening configuration UI:', error);
            vscode.window.showErrorMessage(`Failed to open configuration: ${error}`);
        }
    });

    // Register chat command
    const openChatCommand = vscode.commands.registerCommand('extension.openChat', async () => {
        // Check if user is authenticated (if AD auth is configured)
        const llmConfigCheck = getLLMConfig();
        const adConfig = getADAuthConfig();

        // Block chat if configuration is incomplete
        if (!llmConfigCheck) {
            vscode.window.showErrorMessage('AICKStudio AI is not fully configured. Please complete setup first.');
            await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
            return;
        }
        if (isAuthenticationRequired()) {
                    if (!adConfig?.tenantId || !adConfig?.clientId) {
                        vscode.window.showErrorMessage('AICKStudio AI is not fully configured. Please complete setup first.');
                        await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
                        return;
                    }
                    const authStatus = getAuthenticationStatus();
                    if (!authStatus.isAuthenticated) {
                        vscode.window.showWarningMessage(
                            'Please authenticate with your company AD first.',
                            'Authenticate'
                        ).then(selection => {
                            if (selection === 'Authenticate') {
                                vscode.commands.executeCommand('AICKStudioAI.authenticate');
                            }
                        });
                        return;
                    }
        }

        const panel = vscode.window.createWebviewPanel(
            'AICKStudioChat',
            'AICKStudio AI Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent(context.extensionUri);

        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'ask':
                        await handleChatMessage(panel, message, 'chat');
                        break;

                    case 'search':
                        await handleChatMessage(panel, message, 'websearch');
                        break;

                    case 'generateReadme':
                        await handleChatMessage(panel, message, 'readme');
                        break;

                    case 'createPullRequest':
                        await handleChatMessage(panel, message, 'pullrequest');
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    // Register other commands with authentication checks
    const askCommand = vscode.commands.registerCommand('AICKStudioAI.askAICKStudioOne', async () => {
        if (!checkAuthenticationRequired()) return;
        
        const input = await vscode.window.showInputBox({
            prompt: 'Ask AICKStudio AI anything...', 
            placeHolder: 'Enter your question here'
        });

        if (input) {
            try {
                const llmConfig = getLLMConfig();
                if (!llmConfig) {
                    vscode.window.showErrorMessage('No LLM provider configured. Please configure your settings first.');
                    await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
                    return;
                }

                const llm = getLLM(llmConfig);
                const response = await llm.invoke(input);
                
                // Show response in a new document
                const doc = await vscode.workspace.openTextDocument({
                    content: `Question: ${input}\n\nAnswer:\n${response.content}`,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                telemetryReporter?.sendTelemetryEvent('quickQuery', { provider: llmConfig.provider });
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        }
    });
  
 
    // Register code assistance commands
    const explainCodeCommand = vscode.commands.registerCommand('AICKStudioAI.explainCode', async () => {
        if (!checkAuthenticationRequired()) return;
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText) {
            vscode.window.showErrorMessage('Please select some code to explain');
            return;
        }

        try {
            const llmConfig = getLLMConfig();
            if (!llmConfig) {
                vscode.window.showErrorMessage('No LLM provider configured');
                await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
                return;
            }

            const llm = getLLM(llmConfig);
            const prompt = `Please explain the following code in detail:\n\n\`\`\`${editor.document.languageId}\n${selectedText}\n\`\`\``;
            const response = await llm.invoke(prompt);
            
            // Show explanation in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: `Code Explanation:\n\n${response.content}`,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            telemetryReporter?.sendTelemetryEvent('codeExplanation', { language: editor.document.languageId });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    // Add all commands to subscriptions
    context.subscriptions.push(
        authenticateCommand,
        configureCommand,
        openChatCommand,
        askCommand,
        explainCodeCommand       
    );

    // FIXED: Now that commands are registered, we can safely do configuration checks
    // Force configuration if not done yet
    const llmConfig = getLLMConfig();
    const adConfig = getADAuthConfig();
    const hasConfigured = !!llmConfig && !!adConfig?.tenantId && !!adConfig?.clientId;

    if (!hasConfigured) {
        // OPTION 1: Use setTimeout to ensure command is fully registered
        setTimeout(async () => {
            const configPrompt = await vscode.window.showInformationMessage(
                'Welcome to AICKStudio AI! Please complete initial setup before continuing.',
                'Configure Now'
            );
            if (configPrompt === 'Configure Now') {
                try {
                    console.log('Executing AICKStudioAI.configureSettingsDevFix...');
                    await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
                } catch (err) {
                    console.error('Command execution failed:', err);
                    // FALLBACK: Direct function call if command still fails
                    try {
                        await configProvider.openConfigurationUI(context);
                    } catch (fallbackErr) {
                        console.error('Fallback configuration failed:', fallbackErr);
                        vscode.window.showErrorMessage('Failed to open configuration. Please try again.');
                    }
                }
            }
        }, 100); // Small delay to ensure command registration is complete
    }

    // Check authentication status on startup (this can remain as it doesn't block activation)
    checkAuthenticationStatus();

    // The welcome message will handle the initial prompt for configuration.
    // This will now be the primary way to prompt for config on first run.
    showWelcomeMessage(context);
}

function initializeTelemetry() {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    const instrumentationKey = config.get<string>('telemetry.instrumentationKey', '');
    
    if (instrumentationKey) {
        telemetryReporter = new TelemetryReporter("AICKStudio-ai-vscode");
    }
}

function checkAuthenticationStatus() {
    const adConfig = getADAuthConfig();
    if (isAuthenticationRequired()) {
    if (!adConfig) {
        const authStatus = getAuthenticationStatus();
        if (!authStatus.isAuthenticated) {
            // Try to get stored token
            const authenticator = AzureADAuthenticator.getInstance();
            authenticator.getStoredToken().then(token => {
                if (!token) {
                    vscode.window.showInformationMessage(
                        'AICKStudio AI: Company authentication required',
                        'Authenticate'
                    ).then(selection => {
                        if (selection === 'Authenticate') {
                            vscode.commands.executeCommand('AICKStudioAI.authenticate');
                        }
                    });
                }
            });
        }
    }
}
}

function checkAuthenticationRequired(): boolean {
    if (!isAuthenticationRequired()) {
        // AD Auth disabled, no auth required
        return true;
    }
    const adConfig = getADAuthConfig();
    if (!adConfig) {
        vscode.window.showErrorMessage('Azure AD is enabled but not configured. Please configure.');
        return false;
    }
    const authStatus = getAuthenticationStatus();
    if (!authStatus.isAuthenticated) {
        vscode.window.showWarningMessage(
            'Please authenticate with your company AD first.',
            'Authenticate'
        ).then(selection => {
            if (selection === 'Authenticate') {
                vscode.commands.executeCommand('AICKStudioAI.authenticate');
            }
        });
        return false;
    }
    return true;
}

async function showWelcomeMessage(context: vscode.ExtensionContext) {
    const hasShownWelcome = context.globalState.get('AICKStudioAI.hasShownWelcome', false);
    
    if (!hasShownWelcome) {
        // FIXED: Use setTimeout here too to avoid race conditions
        setTimeout(async () => {
            const selection = await vscode.window.showInformationMessage(
                'Welcome to AICKStudio AI! Configure your AI provider and company authentication to get started.',
                'Configure Now',
                'Later'
            );
            
            if (selection === 'Configure Now') {
                try {
                    await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
                } catch (err) {
                    console.error('Welcome message command execution failed:', err);
                    // Fallback to direct function call
                    const configProvider = AICKStudioAIConfigurationProvider.getInstance();
                    await configProvider.openConfigurationUI(context);
                }
            }
            
            await context.globalState.update('AICKStudioAI.hasShownWelcome', true);
        }, 200); // Slightly longer delay for welcome message
    }
}

function getWebviewContent(extensionUri: vscode.Uri): string {
    const webviewPath = path.join(extensionUri.fsPath, 'webview', 'chat.html');
    const htmlContent = fs.readFileSync(webviewPath, 'utf8');
    return htmlContent;
}

async function handleChatMessage(panel: vscode.WebviewPanel, message: any, agent: string) {
    try {
        const llmConfig = getLLMConfig();
        if (!llmConfig) {
            // If LLM config is missing, prompt user to configure and return
            panel.webview.postMessage({
                command: 'response',
                text: '❌ **Configuration Error**\\n\\nNo LLM provider is configured. Please configure your AI provider in the settings.\\n\\n**Steps:**\\n1. Open Command Palette (Ctrl+Shift+P)\\n2. Run "AICKStudio AI: Configure Settings"\\n3. Select and configure your preferred AI provider'
            });
            await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
            return;
        }

        let response: string;
        let telemetryEvent: string;

        switch (agent) {
            case 'chat':
                const llm = getLLM(llmConfig);
                const chatResponse = await llm.invoke(message.text);
                response = chatResponse.content as string;
                telemetryEvent = 'chatQuery';
                break;

            case 'websearch':
                response = await runLangGraphAgent(message.text);
                telemetryEvent = 'webSearch';
                break;

            case 'readme':
                const readmeContent = await generateReadmeAgent();
                
                // Save README to workspace
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    const readmePath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'README.md');
                    await vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent, 'utf8'));
                    
                    response = `✅ **README.md Generated Successfully!**\\n\\nThe README.md file has been created in your workspace root.\\n\\n**Preview:**\\n\\n${readmeContent.substring(0, 500)}...`;
                } else {
                    response = `📝 **README.md Content Generated:**\\n\\n${readmeContent}`;
                }
                telemetryEvent = 'readmeGenerated';
                break;

            case 'pullrequest':
                const prDescription = await createPullRequestAgent();
                response = `🔄 **Pull Request Description Generated:**\\n\\n${prDescription}\\n\\n**Next Steps:**\\n1. Copy the description above\\n2. Create a new pull request in your repository\\n3. Paste the description\\n4. Review and submit`;
                telemetryEvent = 'pullRequestGenerated';
                break;

            case 'explain':
                const editor = vscode.window.activeTextEditor;
                if (!editor || !editor.selection) {
                    response = '❌ **No Code Selected**\\n\\nPlease select some code in the editor first, then try again.';
                } else {
                    const selectedText = editor.document.getText(editor.selection);
                    if (!selectedText) {
                        response = '❌ **No Code Selected**\\n\\nPlease select some code in the editor first, then try again.';
                    }
                    else {
                        const llm = getLLM(llmConfig);
                        const prompt = `Please explain the following ${editor.document.languageId} code in detail:\\n\\n\`\`\`${editor.document.languageId}\n${selectedText}\n\`\`\``;
                        const explainResponse = await llm.invoke(prompt);
                        response = `💡 **Code Explanation:**\\n\\n${explainResponse.content}`;
                    }
                }
                telemetryEvent = 'codeExplanation';
                break;

            case 'review':
                const reviewEditor = vscode.window.activeTextEditor;
                if (!reviewEditor || !reviewEditor.selection) {
                    response = '❌ **No Code Selected**\\n\\nPlease select some code in the editor first, then try again.';
                } else {
                    const selectedText = reviewEditor.document.getText(reviewEditor.selection);
                    if (!selectedText) {
                        response = '❌ **No Code Selected**\\n\\nPlease select some code in the editor first, then try again.';
                    }
                    else {
                        const llm = getLLM(llmConfig);
                        const prompt = `Please review the following ${reviewEditor.document.languageId} code and provide feedback on:\\n1. Code quality\\n2. Potential bugs\\n3. Performance improvements\\n4. Best practices\\n\\n\`\`\`${reviewEditor.document.languageId}\n${selectedText}\n\`\`\``;
                        const reviewResponse = await llm.invoke(prompt);
                        response = `🔍 **Code Review:**\\n\\n${reviewResponse.content}`;
                    }
                }
                telemetryEvent = 'codeReview';
                break;

            default:
                response = '❌ **Unknown Agent**\\n\\nThe selected agent is not recognized.';
                telemetryEvent = 'unknownAgent';
        }

        panel.webview.postMessage({
            command: 'response',
            text: response
        });
        
        telemetryReporter?.sendTelemetryEvent(telemetryEvent, { 
            provider: llmConfig.provider,
            agent: agent
        });

    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
        panel.webview.postMessage({
            command: 'response',
            text: `❌ **Error:**\\n\\n${error.message}`
        });
        telemetryReporter?.sendTelemetryErrorEvent('agentError', { error: error.message, agent: agent });
    }
}

export function deactivate() {
    telemetryReporter?.dispose();
}

