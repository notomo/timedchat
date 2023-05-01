import { Configuration, OpenAIApi } from "openai";
export { OpenAIApi } from "openai";

export function setupAPI(basePath?: string): OpenAIApi {
  const configuration = new Configuration({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });
  return new OpenAIApi(configuration, basePath);
}
