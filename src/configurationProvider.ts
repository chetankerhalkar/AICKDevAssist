import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class AICKStudioAIConfigurationProvider {
    private static instance: AICKStudioAIConfigurationProvider;
    
    private constructor() {}
    
    public static getInstance(): AICKStudioAIConfigurationProvider {
        if (!AICKStudioAIConfigurationProvider.instance) {
            AICKStudioAIConfigurationProvider.instance = new AICKStudioAIConfigurationProvider();
        }
        return AICKStudioAIConfigurationProvider.instance;
    }

    public async openConfigurationUI(context: vscode.ExtensionContext) {
        console.log('[AICKStudio AI] configureSettings command executed');
        const panel = vscode.window.createWebviewPanel(
            'AICKStudioAIConfig',
            'AICKStudio AI Configuration',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
          
        );
  console.log('[AICKStudio AI] Opening config UI...');
        panel.webview.html = this.getWebviewContent(context.extensionUri);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'saveConfiguration':
                        await this.saveConfiguration(message.config);
                        vscode.window.showInformationMessage('Configuration saved successfully!');
                        break;
                    case 'loadConfiguration':
                        const config = this.loadConfiguration();
                        panel.webview.postMessage({ command: 'configurationLoaded', config });
                        break;
                    case 'testConnection':
                        const result = await this.testLLMConnection(message.provider, message.config);
                        panel.webview.postMessage({ command: 'connectionTestResult', result });
                        break;
                    case 'resetToDefaults':
                        await this.resetToDefaults();
                        const defaultConfig = this.loadConfiguration();
                        panel.webview.postMessage({ command: 'configurationLoaded', config: defaultConfig });
                        vscode.window.showInformationMessage('Configuration reset to defaults!');
                        break;
                    case 'authenticateAD':
                        const authResult = await this.authenticateWithAD(message.config);
                        panel.webview.postMessage({ command: 'adAuthResult', result: authResult });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Load current configuration when panel opens
        setTimeout(() => {
            const config = this.loadConfiguration();
            panel.webview.postMessage({ command: 'configurationLoaded', config });
        }, 100);
    }

    private getWebviewContent(extensionUri: vscode.Uri): string {
        const webviewPath = path.join(extensionUri.fsPath, 'webview', 'config.html');
        const htmlContent = fs.readFileSync(webviewPath, 'utf8');
        return htmlContent;
    }

    private loadConfiguration(): any {
        const config = vscode.workspace.getConfiguration('AICKStudioAI');
        return {
            llmProvider: config.get('llmProvider', 'azure_openai'),
            adAuth: {
                enabled: config.get<boolean>('adAuth.enabled', true),
                tenantId: config.get('adAuth.tenantId', ''),
                clientId: config.get('adAuth.clientId', ''),
                redirectUri: config.get('adAuth.redirectUri', ''),
                resource: config.get('adAuth.resource', '')
            },
            azureOpenAI: {
                apiKey: config.get('azureOpenAI.apiKey', ''),
                endpoint: config.get('azureOpenAI.endpoint', ''),
                modelName: config.get('azureOpenAI.modelName', 'gpt-4o')
            },
            openai: {
                apiKey: config.get('openai.apiKey', ''),
                modelName: config.get('openai.modelName', 'gpt-4o')
            },
            gemini: {
                apiKey: config.get('gemini.apiKey', ''),
                modelName: config.get('gemini.modelName', 'gemini-pro')
            },
            tavily: {
                apiKey: config.get('tavily.apiKey', '')
            },
            telemetry: {
                instrumentationKey: config.get('telemetry.instrumentationKey', '')
            },
            azure: {
                sql: {
                    server: config.get('azure.sql.server', ''),
                    database: config.get('azure.sql.database', ''),
                    user: config.get('azure.sql.user', ''),
                    password: config.get('azure.sql.password', '')
                }
            },
            weaviate: {
                host: config.get('weaviate.host', ''),
                apiKey: config.get('weaviate.apiKey', '')
            }
        };
    }

   private async saveConfiguration(configData: any): Promise<void> {
    try {
        console.log('Saving configuration:', configData);
    const config = vscode.workspace.getConfiguration('AICKStudioAI');

    await config.update('llmProvider', configData.llmProvider, vscode.ConfigurationTarget.Global);

    // AD Auth (safeguard nested properties)
    await config.update('adAuth.enabled', configData.adAuth?.enabled ?? true, vscode.ConfigurationTarget.Global);
    await config.update('adAuth.tenantId', configData.adAuth?.tenantId ?? '', vscode.ConfigurationTarget.Global);
    await config.update('adAuth.clientId', configData.adAuth?.clientId ?? '', vscode.ConfigurationTarget.Global);
    await config.update('adAuth.redirectUri', configData.adAuth?.redirectUri ?? '', vscode.ConfigurationTarget.Global);
    await config.update('adAuth.resource', configData.adAuth?.resource ?? '', vscode.ConfigurationTarget.Global);

    // Azure OpenAI
    await config.update('azureOpenAI.apiKey', configData.azureOpenAI?.apiKey ?? '', vscode.ConfigurationTarget.Global);
    await config.update('azureOpenAI.endpoint', configData.azureOpenAI?.endpoint ?? '', vscode.ConfigurationTarget.Global);
    await config.update('azureOpenAI.modelName', configData.azureOpenAI?.modelName ?? '', vscode.ConfigurationTarget.Global);

    // OpenAI
    await config.update('openai.apiKey', configData.openai?.apiKey ?? '', vscode.ConfigurationTarget.Global);
    await config.update('openai.modelName', configData.openai?.modelName ?? '', vscode.ConfigurationTarget.Global);

    // Gemini
    await config.update('gemini.apiKey', configData.gemini?.apiKey ?? '', vscode.ConfigurationTarget.Global);
    await config.update('gemini.modelName', configData.gemini?.modelName ?? '', vscode.ConfigurationTarget.Global);

    // Other services
    await config.update('tavily.apiKey', configData.tavily?.apiKey ?? '', vscode.ConfigurationTarget.Global);
    await config.update('telemetry.instrumentationKey', configData.telemetry?.instrumentationKey ?? '', vscode.ConfigurationTarget.Global);

    // Azure SQL (nested under azure.sql)
    await config.update('azure.sql.server', configData.azure?.sql?.server ?? '', vscode.ConfigurationTarget.Global);
    await config.update('azure.sql.database', configData.azure?.sql?.database ?? '', vscode.ConfigurationTarget.Global);
    await config.update('azure.sql.user', configData.azure?.sql?.user ?? '', vscode.ConfigurationTarget.Global);
    await config.update('azure.sql.password', configData.azure?.sql?.password ?? '', vscode.ConfigurationTarget.Global);

    // Weaviate
    await config.update('weaviate.host', configData.weaviate?.host ?? '', vscode.ConfigurationTarget.Global);
    await config.update('weaviate.apiKey', configData.weaviate?.apiKey ?? '', vscode.ConfigurationTarget.Global);
    } catch (error) {
        console.error('Error saving configuration:', error);
        throw error; // or handle gracefully
    }

}

    private async testLLMConnection(provider: string, config: any): Promise<{ success: boolean; error?: string }> {
        try {
            // Import LLM modules dynamically to test connection
            const { getLLM } = await import('./llm');
            
            const llmConfig = {
                provider: provider as any,
                apiKey: config.apiKey,
                endpoint: config.endpoint,
                modelName: config.modelName
            };

            const llm = getLLM(llmConfig);
            
            // Test with a simple prompt
            const response = await llm.invoke('Hello, this is a connection test. Please respond with "Connection successful!"');
            
            if (response && response.content) {
                return { success: true };
            } else {
                return { success: false, error: 'No response received from LLM' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    }

    private async authenticateWithAD(config: any): Promise<{ success: boolean; error?: string; userInfo?: any }> {
        try {
            // Import AD authentication module
            const { authenticateWithAzureAD } = await import('./adAuth');
            
            const result = await authenticateWithAzureAD({
                tenantId: config.tenantId,
                clientId: config.clientId,
                redirectUri: config.redirectUri,
                resource: config.resource
            });

            if (result.success) {
                return { 
                    success: true, 
                    userInfo: result.userInfo 
                };
            } else {
                return { 
                    success: false, 
                    error: result.error || 'Authentication failed' 
                };
            }
        } catch (error: any) {
            return { 
                success: false, 
                error: error.message || 'Authentication error occurred' 
            };
        }
    }

    private async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration('AICKStudioAI');
        
        // Reset all configuration values to their defaults
        const configKeys = [
            'llmProvider', 'adAuth.tenantId', 'adAuth.clientId', 'adAuth.redirectUri', 'adAuth.resource',
            'azureOpenAI.apiKey', 'azureOpenAI.endpoint', 'azureOpenAI.modelName',
            'openai.apiKey', 'openai.modelName', 'gemini.apiKey', 'gemini.modelName',
            'tavily.apiKey', 'telemetry.instrumentationKey',
            'azure.sql.server', 'azure.sql.database', 'azure.sql.user', 'azure.sql.password',
            'weaviate.host', 'weaviate.apiKey'
        ];

        for (const key of configKeys) {
            await config.update(key, undefined, vscode.ConfigurationTarget.Global);
        }
    }
}


