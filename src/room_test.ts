import { Deps, responses } from "./test/helper.ts";
import * as rooms from "./room.ts";
import { assertEquals } from "testing/asserts";

Deno.test("rooms", async (t) => {
  await t.step(
    "register success",
    Deps.setup(async (deps) => {
      const db = await deps.setupDB();
      const openai = deps.setupOpenAIApi(
        {
          respond: responses.createChatCompletion200(),
        },
      );

      await rooms.register(db, openai, [
        {
          key: "test1",
          tasks: [
            {
              type: "oneshot",
              prompt: "test",
            },
            {
              type: "periodic",
              prompt: "test",
              maxRuns: 1,
              cron: "*/1 * * * * *",
            },
          ],
        },
      ]);

      const summary = rooms.list(db);
      assertEquals(summary.length, 1);
      assertEquals(summary[0].key, "test1");

      const messages = rooms.listMessages(db, "test1");
      assertEquals(messages.length, 2);
      assertEquals(messages[0].responseStatus, 200);
    }),
  );

  await t.step(
    "register failure",
    Deps.setup(async (deps) => {
      const db = await deps.setupDB();
      const openai = deps.setupOpenAIApi(
        {
          respond: responses.createChatCompletion401(),
        },
      );

      await rooms.register(db, openai, [
        {
          key: "test1",
          tasks: [
            {
              type: "oneshot",
              prompt: "test",
            },
          ],
        },
      ]);

      const messages = rooms.listMessages(db, "test1");
      assertEquals(messages[0].responseStatus, 401);
    }),
  );
});
