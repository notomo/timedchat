import { Command } from "cliffy/command";
import * as configs from "./config.ts";
import { Deps } from "./dep.ts";
import * as rooms from "./room.ts";

async function main() {
  await new Command()
    .name("timedchat")
    .version("0.0.0")
    .command("start")
    .option("--config <config:string>", "config file path", {
      required: false,
      default: configs.getDefaultPath(),
    })
    .action(Deps.setup(async (deps: Deps, options: { config: string }) => {
      const config = await configs.load(options.config);
      const db = await deps.setupDB();
      const openai = deps.setupOpenAIApi();
      await rooms.register(db, openai, config.rooms);
    }))
    .command(
      "room",
      new Command()
        .command("list")
        .action(Deps.setup(async (deps: Deps) => {
          const db = await deps.setupDB();
          const summary = rooms.list(db);
          console.log(JSON.stringify(summary, null, 2));
        }))
        .command("history")
        .option("--key <key:string>", "room key", {
          required: true,
        })
        .action(Deps.setup(async (deps: Deps, options: { key: string }) => {
          const db = await deps.setupDB();
          const messages = rooms.listMessages(db, options.key);
          console.log(JSON.stringify(messages, null, 2));
        })),
    )
    .parse(Deno.args);
}

await main();
