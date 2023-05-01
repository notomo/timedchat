import { Command } from "cliffy/command";
import * as configs from "./config.ts";
import * as dbs from "./db/mod.ts";
import * as openais from "./openai/mod.ts";
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
    .action(async (options: { config: string }) => {
      const config = await configs.load(options.config);
      const [db, teardown] = await dbs.setupDB();
      const openai = openais.setupAPI();
      try {
        await rooms.register(db, openai, config.rooms);
      } finally {
        teardown();
      }
    })
    .command(
      "room",
      new Command()
        .command("list")
        .action(async () => {
          const [db, teardown] = await dbs.setupDB();
          try {
            const summary = rooms.list(db);
            console.log(JSON.stringify(summary, null, 2));
          } finally {
            teardown();
          }
        })
        .command("history")
        .option("--key <key:string>", "room key", {
          required: true,
        })
        .action(async (options: { key: string }) => {
          const [db, teardown] = await dbs.setupDB();
          try {
            const messages = rooms.listMessages(db, options.key);
            console.log(JSON.stringify(messages, null, 2));
          } finally {
            teardown();
          }
        }),
    )
    .parse(Deno.args);
}

await main();
