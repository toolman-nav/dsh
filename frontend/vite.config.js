import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const root = dirname(fileURLToPath(import.meta.url));
const INDEX_KEYS = [
  "id",
  "owner",
  "name",
  "description",
  "stars",
  "updatedAt",
  "createdAt",
  "topics",
  "capability",
  "kind",
  "featured",
  "pluginLike",
  "installCommand",
];

function sliceCatalog() {
  const catalog = JSON.parse(readFileSync(resolve(root, "public/catalog.json"), "utf8"));
  const all = Array.isArray(catalog.plugins) ? catalog.plugins : [];
  const plugins = all.filter((plugin) => plugin.pluginLike);
  const newest = [...plugins].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))).slice(0, 8);
  const popular = [...plugins].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 8);
  const featured = plugins.filter((plugin) => plugin.featured).slice(0, 12);
  const meta = {
    lastCrawledAt: catalog.lastCrawledAt || "",
    total: plugins.length,
    topicTotal: all.length,
  };
  return {
    meta,
    home: {
      ...meta,
      featured: featured.length ? featured : popular.slice(0, 8),
      newest,
      popular,
    },
    index: {
      plugins: all.map((plugin) => Object.fromEntries(INDEX_KEYS.map((key) => [key, plugin[key]]))),
    },
  };
}

function sendJson(res, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function catalogDevPages() {
  let slices;
  const load = () => {
    slices ||= sliceCatalog();
    return slices;
  };
  const serve = (req, res, next) => {
    const url = String(req.url || "").split("?")[0];
    try {
      if (url === "/data/home.json") return sendJson(res, load().home);
      if (url === "/data/meta.json") return sendJson(res, load().meta);
      if (url === "/data/catalog-index.json") return sendJson(res, load().index);
    } catch (error) {
      return next(error);
    }
    return next();
  };
  return {
    name: "catalog-dev-pages",
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}

export default defineConfig({
  plugins: [vue(), catalogDevPages()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8080",
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": "http://127.0.0.1:8080",
    },
  },
});
