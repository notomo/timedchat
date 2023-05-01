import * as toml from "toml";
import xdg from "xdg";
import { join } from "path";
import { deepMerge } from "deep_merge";
import { Rooms } from "./room.ts";

export type Config = Readonly<{
  rooms: Rooms;
}>;

const defaultConfig = {
  rooms: [],
} as const satisfies Config;

export async function load(path: string): Promise<Config> {
  const str = await Deno.readTextFile(path);
  const rawConfig = toml.parse(str);
  const config = deepMerge(rawConfig, defaultConfig) as Config;
  return config;
}

export function getDefaultPath(): string {
  return join(xdg.config(), "timedchat.toml");
}
