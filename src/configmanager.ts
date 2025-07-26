import * as vscode from 'vscode';
import { LLMConfig } from './config';

export function getLLMConfig(): LLMConfig | undefined {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  const provider = config.get<string>('llmProvider', 'azure_openai') as 'azure_openai' | 'openai' | 'gemini';

  switch (provider) {
    case 'azure_openai':
      return {
        provider: 'azure_openai',
        apiKey: config.get<string>('azureOpenAI.apiKey', ''),
        endpoint: config.get<string>('azureOpenAI.endpoint', ''),
        modelName: config.get<string>('azureOpenAI.modelName', 'gpt-4o')
      };
    case 'openai':
      return {
        provider: 'openai',
        apiKey: config.get<string>('openai.apiKey', ''),
        modelName: config.get<string>('openai.modelName', 'gpt-4o')
      };
    case 'gemini':
      return {
        provider: 'gemini',
        apiKey: config.get<string>('gemini.apiKey', ''),
        modelName: config.get<string>('gemini.modelName', 'gemini-pro')
      };
    default:
      return undefined;
  }
}

export function getAuthServiceUrl(): string {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  return config.get<string>('authServiceUrl', '');
}

export function getTelemetryInstrumentationKey(): string {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  return config.get<string>('telemetry.instrumentationKey', '');
}

export function getTavilyApiKey(): string {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  return config.get<string>('tavily.apiKey', '');
}

export function getAzureSqlConfig() {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  return {
    user: config.get<string>('azure.sql.user', ''),
    password: config.get<string>('azure.sql.password', ''),
    server: config.get<string>('azure.sql.server', ''),
    database: config.get<string>('azure.sql.database', ''),
    options: { encrypt: true, trustServerCertificate: false }
  };
}

export function getWeaviateConfig() {
  const config = vscode.workspace.getConfiguration('AICKStudioAI');
  return {
    scheme: config.get<string>('weaviate.scheme', 'https'),
    host: config.get<string>('weaviate.host', ''),
    apiKey: config.get<string>('weaviate.apiKey', '')
  };
}

