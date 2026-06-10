import { tool } from '@openai/agents';
import { z } from 'zod';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export const tavilySearch = tool({
  name: 'tavily_search',
  description: 'Search the web for factual information. Returns key findings and source URLs.',
  parameters: z.object({
    query: z.string().describe('The search query to look up.'),
  }),
  execute: async ({ query }) => {
    if (!TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY is not set in environment variables.');
    }

    console.log(`[Tavily] Searching for: "${query}"...`);

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily API Error: ${errorText}`);
    }

    const data = await response.json();
    
    // Format the results to only include key findings and sources as per requirements
    const results = data.results.map((result: any) => ({
      title: result.title,
      content: result.content?.slice(0, 300),
      url: result.url,
    }));

    return JSON.stringify({
      findings: results,
      sources: results.map((r: any) => r.url),
    }, null, 2);
  },
});
