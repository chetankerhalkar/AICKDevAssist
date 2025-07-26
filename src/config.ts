import * as vscode from 'vscode';

export interface LLMConfig {
    provider: 'azure_openai' | 'openai' | 'gemini';
    apiKey: string;
    endpoint?: string; // For Azure OpenAI
    modelName: string;
    isAuthenticated?: boolean;
    userInfo?: any;
}

export interface ADAAuthConfig {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    resource?: string;
}

export function getLLMConfig(): LLMConfig | null {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    const provider = config.get<string>('llmProvider', 'azure_openai') as 'azure_openai' | 'openai' | 'gemini';
    
    let llmConfig: LLMConfig | null = null;
    
    switch (provider) {
        case 'azure_openai':
            const azureApiKey = config.get<string>('azureOpenAI.apiKey', '');
            const azureEndpoint = config.get<string>('azureOpenAI.endpoint', '');
            const azureModel = config.get<string>('azureOpenAI.modelName', 'gpt-4o');
            
            if (azureApiKey && azureEndpoint) {
                llmConfig = {
                    provider: 'azure_openai',
                    apiKey: azureApiKey,
                    endpoint: azureEndpoint,
                    modelName: azureModel
                };
            }
            break;
            
        case 'openai':
            const openaiApiKey = config.get<string>('openai.apiKey', '');
            const openaiModel = config.get<string>('openai.modelName', 'gpt-4o');
            
            if (openaiApiKey) {
                llmConfig = {
                    provider: 'openai',
                    apiKey: openaiApiKey,
                    modelName: openaiModel
                };
            }
            break;
            
        case 'gemini':
            const geminiApiKey = config.get<string>('gemini.apiKey', '');
            const geminiModel = config.get<string>('gemini.modelName', 'gemini-pro');
            
            if (geminiApiKey) {
                llmConfig = {
                    provider: 'gemini',
                    apiKey: geminiApiKey,
                    modelName: geminiModel
                };
            }
            break;
    }
    
    // Add authentication info if available
    if (llmConfig) {
        try {
            const { getAuthenticationStatus } = require('./adAuth');
            const authStatus = getAuthenticationStatus();
            llmConfig.isAuthenticated = authStatus.isAuthenticated;
            llmConfig.userInfo = authStatus.userInfo;
        } catch (error) {
            // AD Auth module not available or not configured
            llmConfig.isAuthenticated = false;
        }
    }
    
    return llmConfig;
}

export function getADAuthConfig(): ADAAuthConfig | null {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');

    const isEnabled = config.get<boolean>('adAuth.enabled', true);
    if (!isEnabled) {
        // AD Auth disabled, return null to signify no config
        return null;
    }

    const tenantId = config.get<string>('adAuth.tenantId', '');
    const clientId = config.get<string>('adAuth.clientId', '');
    const redirectUri = config.get<string>('adAuth.redirectUri', 'vscode://AICKStudiodigital.AICKStudio-ai-vscode/auth');
    const resource = config.get<string>('adAuth.resource', '');

    if (tenantId && clientId) {
        return {
            tenantId,
            clientId,
            redirectUri,
            resource
        };
    }

    return null;
}

export function getTavilyConfig(): { apiKey: string } | null {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    const apiKey = config.get<string>('tavily.apiKey', '');
    
    if (apiKey) {
        return { apiKey };
    }
    
    return null;
}

export function getAzureSQLConfig(): { server: string; database: string; user: string; password: string } | null {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    
    const server = config.get<string>('azure.sql.server', '');
    const database = config.get<string>('azure.sql.database', '');
    const user = config.get<string>('azure.sql.user', '');
    const password = config.get<string>('azure.sql.password', '');
    
    if (server && database && user && password) {
        return { server, database, user, password };
    }
    
    return null;
}

export function getWeaviateConfig(): { host: string; apiKey: string } | null {
    const config = vscode.workspace.getConfiguration('AICKStudioAI');
    
    const host = config.get<string>('weaviate.host', '');
    const apiKey = config.get<string>('weaviate.apiKey', '');
    
    if (host && apiKey) {
        return { host, apiKey };
    }
    
    return null;
}

