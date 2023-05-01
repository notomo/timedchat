import { DB } from "./db/mod.ts";
import { OpenAIApi } from "./openai/mod.ts";
import { Cron } from "croner";

type Task = OneshotTask | PeriodicTask;

type OneshotTask = Readonly<{
  type: "oneshot";
  prompt: string;
}>;

type PeriodicTask = Readonly<{
  type: "periodic";
  prompt: string;
  cron: string;
  maxRuns?: number;
}>;

export type Tasks = Readonly<Task[]>;

export async function start(
  db: DB,
  openai: OpenAIApi,
  roomKey: string,
  tasks: Tasks,
) {
  await Promise.all(tasks.map((task) => {
    return startOne(db, openai, roomKey, task);
  }));
}

function startOne(
  db: DB,
  openai: OpenAIApi,
  roomKey: string,
  task: Task,
): Promise<void> {
  switch (task.type) {
    case "oneshot":
      return executeOne(db, openai, roomKey, task);
    case "periodic":
      return startPeriodic(db, openai, roomKey, task);
    default:
      return Promise.resolve(assertNever(task));
  }
}

async function executeOne(
  db: DB,
  openai: OpenAIApi,
  roomKey: string,
  task: Task,
) {
  let raw;
  let responseStatus = 200;
  const request = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system" as const,
        content: task.prompt,
      },
    ],
  };
  try {
    const completion = await openai.createChatCompletion(request);
    raw = JSON.stringify(completion.data);
  } catch (err) {
    if (err.respnse === null) {
      throw err;
    }
    raw = JSON.stringify(err.response.data);
    responseStatus = err.response.status;
  }

  db.query(
    `INSERT INTO message (roomKey, request, responseStatus, raw) VALUES (:roomKey, :request, :responseStatus, :raw);`,
    {
      roomKey: roomKey,
      request: JSON.stringify(request),
      responseStatus: responseStatus,
      raw: raw,
    },
  );
}

function startPeriodic(
  db: DB,
  openai: OpenAIApi,
  roomKey: string,
  task: PeriodicTask,
) {
  return new Promise<void>((resolve, reject) => {
    const finishIfCompleted = (cron: Cron) => {
      if (cron.nextRun() !== null) {
        return;
      }
      setTimeout(resolve);
    };

    const cron = new Cron(task.cron, async () => {
      try {
        await executeOne(db, openai, roomKey, task);
      } catch (err) {
        reject(err);
        return;
      }
      finishIfCompleted(cron);
    }, {
      maxRuns: task.maxRuns,
      protect: true,
    });

    finishIfCompleted(cron);
  });
}

function assertNever(_x: never) {}
