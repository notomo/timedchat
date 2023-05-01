import xdg from "xdg";
import { ensureDir } from "fs";
import { join } from "path";
import { DB } from "sqlite";
export { DB } from "sqlite";
import sql from "./gen_sql.json" assert { type: "json" };

function getDataDir(): string {
  return join(xdg.data(), "timedchat");
}

type Teardown = () => void;

export async function setupDB(
  dataDir: string = getDataDir(),
): Promise<[DB, Teardown]> {
  await ensureDir(dataDir);

  const dataPath = join(dataDir, "data.db");

  const db = new DB(dataPath);
  const teardown = () => {
    db.close();
  };

  try {
    db.execute(sql.createTable);
  } catch (err) {
    teardown();
    throw err;
  }

  return [db, teardown];
}
