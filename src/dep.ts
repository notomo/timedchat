import { DB, setupDB } from "./db/mod.ts";
import { OpenAIApi, setupAPI } from "./openai/mod.ts";

type Action<T> = (deps: Deps, opts: T) => Promise<void> | void;
type Teardown = () => void;

export class Deps {
  private readonly teardowns: Teardown[] = [];

  private constructor() {}

  static setup<T>(action: Action<T>): (opts: T) => Promise<void> {
    return async (opts: T) => {
      const deps = new Deps();
      try {
        await action(deps, opts);
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
    const [db, teardown] = await setupDB();
    this.teardowns.push(teardown);
    return db;
  }

  setupOpenAIApi(): OpenAIApi {
    return setupAPI();
  }
}
