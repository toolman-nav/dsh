import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const api = (process.env.BAY_API || "http://127.0.0.1:8080").replace(/\/$/, "");
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../public/catalog.json");

const res = await fetch(`${api}/api/catalog`);
if (!res.ok) {
  throw new Error(`export failed: HTTP ${res.status} from ${api}/api/catalog`);
}
const data = await res.json();
if (!Array.isArray(data.plugins)) {
  throw new Error("export failed: missing plugins[]");
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data));
console.log(`wrote ${data.plugins.length} plugins to ${out}`);
