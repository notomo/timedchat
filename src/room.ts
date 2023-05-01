import { DB } from "./db/mod.ts";
import { OpenAIApi } from "./openai/mod.ts";
import * as tasks from "./task.ts";

type Room = Readonly<{
  key: string;
  tasks: tasks.Tasks;
}>;

export type Rooms = Readonly<Room[]>;

export async function register(
  db: DB,
  openai: OpenAIApi,
  rooms: Rooms,
): Promise<void> {
  await Promise.all(rooms.map((room) => {
    return registerOne(db, openai, room);
  }));
}

function registerOne(db: DB, openai: OpenAIApi, room: Room): Promise<void> {
  db.query(`INSERT OR IGNORE INTO room (key) VALUES (:key);`, {
    key: room.key,
  });
  return tasks.start(db, openai, room.key, room.tasks);
}

export function list(db: DB) {
  const query = `SELECT key FROM room`;
  const rooms = db.queryEntries<{ key: string }>(query);
  return rooms;
}

export function listMessages(db: DB, roomKey: string) {
  const query =
    `SELECT request, responseStatus, raw FROM message WHERE roomKey = :roomKey`;
  const rows = db.queryEntries<{
    request: string;
    responseStatus: number;
    raw: string;
  }>(query, {
    roomKey: roomKey,
  });
  const messages = rows.map((row) => {
    return {
      responseStatus: row.responseStatus,
      request: JSON.parse(row.request),
      raw: JSON.parse(row.raw),
    };
  });
  return messages;
}
