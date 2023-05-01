import { DB, setupDB } from "../db/mod.ts";
import { OpenAIApi, setupAPI } from "../openai/mod.ts";
import { MockHandler, setupServer } from "./server.ts";
export * as responses from "./response.ts";

type Test = (deps: Deps) => Promise<void> | void;

type Teardown = () => void;

export class Deps {
  private readonly teardowns: Teardown[] = [];

  private constructor() {}

  static setup(test: Test): () => Promise<void> {
    return async () => {
      const deps = new Deps();
      try {
        await test(deps);
      } finally {
        deps.teardown();
      }
    };
  }

  private teardown() {
    for (const teardown of this.teardowns) {
      teardown();
    }
  }

  async setupDB(): Promise<DB> {
    const tmpDir = await Deno.makeTempDir();
    const [db, teardown] = await setupDB(tmpDir);

    this.teardowns.push(teardown);

    return db;
  }

  setupOpenAIApi(
    ...handlers: MockHandler[]
  ): OpenAIApi {
    const [url, teardown] = setupServer(...handlers);
    this.teardowns.push(teardown);
    return setupAPI(url);
  }
}
