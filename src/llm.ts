
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMConfig } from "./config";

export function getLLM(config: LLMConfig) {
  switch (config.provider) {
    case 'azure_openai':
      return new ChatOpenAI({
        temperature: 0.4,
        openAIApiKey: config.apiKey,
        configuration: {
          baseURL: config.endpoint,
          defaultQuery: { "api-version": "2025-01-01-preview" },
          defaultHeaders: { "api-key": config.apiKey }
        },
        modelName: config.modelName || "gpt-4o",
      });
    case 'openai':
      return new ChatOpenAI({
        temperature: 0.4,
        openAIApiKey: config.apiKey,
        modelName: config.modelName || "gpt-4o",
      });
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        apiKey: config.apiKey,
        modelName: config.modelName || "gemini-pro",
        temperature: 0.4,
      });
    default:
      throw new Error("Unsupported LLM provider");
  }
}


