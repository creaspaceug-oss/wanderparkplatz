import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

/** Repo-Root, unabhängig vom cwd (npm-Workspaces setzen es aufs Paket). */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RAW = join(ROOT, "data", "raw");
export const OUT = join(ROOT, "data", "out");
export const raw = (f: string) => join(RAW, f);
export const out = (f: string) => join(OUT, f);
