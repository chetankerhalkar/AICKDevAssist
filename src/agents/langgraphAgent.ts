import * as vscode from 'vscode';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { Graph } from '@langchain/langgraph';
import { RunnableLambda } from '@langchain/core/runnables';
import { getLLM } from '../llm';
import { getLLMConfig, getTavilyConfig } from '../config';

/** The minimal shape of the compiled graph we care about */
interface GraphRunner {
  // This interface defines what 'invoke' returns.
  // Since the graph internal state is { input: string }, the final result will also be this.
  invoke(input: { input: string }): Promise<{ input: string }>; //
}

/** Cached compiled graph – built on first use */
let compiledGraph: GraphRunner | undefined;

/**
 * Builds (once) and returns a runnable LangGraph.
 * Throws if the user hasn’t finished configuring an LLM provider.
 */
async function ensureGraph(): Promise<GraphRunner> {
  if (compiledGraph) return compiledGraph;

  // ── 1. Verify LLM configuration ───────────────────────────────────────
  const llmConfig = getLLMConfig();
  if (!llmConfig) {
    vscode.window.showErrorMessage(
      'No LLM provider configured. Please run "AICKStudio AI: Configure Settings" first.'
    );
    throw new Error('LLM configuration missing');
  }
  const llm = getLLM(llmConfig);

  // ── 2. Get Tavily API key ─────────────────────────────────────────────
  const tavilyConfig = getTavilyConfig();
  if (!tavilyConfig?.apiKey) {
    throw new Error('Tavily API key not configured. Please go to "Configure Settings" and add it.');
  }

  const webSearch = new TavilySearchResults({ apiKey: tavilyConfig.apiKey });

  // ── 3. Define Graph Nodes ─────────────────────────────────────────────
  const graph = new Graph<
    '__start__' | 'search' | 'summarize' | '__end__',
    { input: string } // This generic type parameter defines the shape of data passed between nodes
  >();

  // 🟢 __start__ is the entry point, it directly routes to 'search'
  const startNode = RunnableLambda.from(async (input: { input: string }) => {
    // This node's purpose is simply to transition to the next state, 'search'
    return input; // Pass the input along as { input: string }
  });

  const searchNode = RunnableLambda.from(async (input: { input: string }) =>
    // The webSearch.invoke returns a string, but for the graph, we need to return { input: string }
    {
      const searchResult = await webSearch.invoke(input.input);
      return { input: searchResult };
    }
  );

const summarizeNode = RunnableLambda.from(async (input: any) => {
  let results: any[] = [];

  try {
    // If it's a stringified array, parse it
    results = typeof input.input === 'string' ? JSON.parse(input.input) : input.input;
  } catch (err) {
    return { input: '❌ Failed to parse search results.' };
  }

  if (!Array.isArray(results) || results.length === 0) {
    return { input: '⚠️ No relevant web search results found.' };
  }

  const summaryText = results
    .slice(0, 5)
    .map((r: any) => `🔹 ${r.title}\n${r.content}`)
    .join('\n\n');

  const summary = await llm.invoke(
    `Summarize the following web search results:\n\n${summaryText}`
  );

const links = results
  .slice(0, 5)
  .map((r: any) => `<p><a href="${r.url}" target="_blank">${r.title}</a></p>`)
  .join('');
  
  const output = `🔍 **Search Summary**\n\n${summary.content}\n\n📎 **Sources:**\n${links}`;
  return { input: output };
});

  // ── 4. Register Nodes and Edges ───────────────────────────────────────
  graph.addNode('__start__', startNode as any);
  graph.addNode('search', searchNode as any);
  graph.addNode('summarize', summarizeNode);

  // Define the entry point for the graph
  graph.setEntryPoint('__start__');

  // Directly connect __start__ to search since it's an unconditional transition
  graph.addEdge('__start__', 'search');
  graph.addEdge('search', 'summarize');
  graph.addEdge('summarize', '__end__');

  compiledGraph = graph.compile() as unknown as GraphRunner;
  return compiledGraph;
}

/**
 * Public helper the rest of your extension calls.
 * Always returns a printable string (result or error) so UI code can show it.
 */
export async function runLangGraphAgent(userQuery: string): Promise<string> {
  try {
    const graph = await ensureGraph();
    // The invoke method now returns an object { input: string } as per GraphRunner interface
    const result = await graph.invoke({ input: userQuery });
    // Extract the string from the 'input' property of the returned object
    return result.input;
  } catch (err: any) {
    return `❌ ${err.message ?? 'Unknown error running web-search agent.'}`;
  }
}