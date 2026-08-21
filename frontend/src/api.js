import { catalogDetail, catalogHome, catalogMeta, catalogSearch } from "./catalog.js";
import { normalizePlugin } from "./taxonomy.js";

const API = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const useStatic = !API && (import.meta.env.PROD || import.meta.env.VITE_STATIC === "1");

async function getJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function normalizePlugins(items) {
  return Array.isArray(items) ? items.map(normalizePlugin) : [];
}

function normalizeHome(data) {
  return {
    ...data,
    featured: normalizePlugins(data?.featured),
    newest: normalizePlugins(data?.newest),
    popular: normalizePlugins(data?.popular),
  };
}

function normalizePage(data) {
  return {
    ...data,
    content: normalizePlugins(data?.content),
  };
}

export async function fetchHome() {
  return normalizeHome(await (useStatic ? catalogHome() : getJson("/api/home")));
}

export function fetchMeta() {
  return useStatic ? catalogMeta() : getJson("/api/meta");
}

export async function fetchPlugins({ q = "", capability = "", kind = "", featured = false, includeAll = false, sort = "updated", page = 0, size = 24 } = {}) {
  if (useStatic) {
    return normalizePage(await catalogSearch({ q, capability, kind, featured, includeAll, sort, page, size }));
  }
  const params = new URLSearchParams({
    q,
    capability,
    kind,
    featured: String(featured),
    includeAll: String(includeAll),
    sort,
    page: String(page),
    size: String(size),
  });
  return normalizePage(await getJson(`/api/plugins?${params}`));
}

export async function fetchPlugin(owner, name) {
  if (useStatic) {
    const plugin = await catalogDetail(owner, name);
    if (!plugin) {
      throw new Error("HTTP 404");
    }
    return normalizePlugin(plugin);
  }
  return normalizePlugin(await getJson(`/api/plugins/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`));
}

function githubRepo(plugin) {
  const url = String(plugin?.htmlUrl || "");
  const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  const name = String(plugin?.name || "").split("#")[0];
  return { owner: plugin?.owner, repo: name };
}

async function fetchText(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    return null;
  }
  const text = await res.text();
  if (!text || text.startsWith("Couldn't find") || text.startsWith("404:")) {
    return null;
  }
  return text;
}

export async function hydrateReadme(plugin, chinese) {
  if (!plugin) {
    return plugin;
  }
  const locales = plugin.readmeLocales || {};
  if (plugin.readmeMarkdown || locales.zh || locales.en || locales.default) {
    return plugin;
  }
  const { owner, repo } = githubRepo(plugin);
  if (!owner || !repo) {
    return plugin;
  }
  const branch = plugin.defaultBranch || "main";
  const files = chinese
    ? ["README.zh-CN.md", "README.zh.md", "README.md"]
    : ["README.md", "README.en.md"];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const found = {};
    await Promise.all(
      files.map(async (file) => {
        const encoded = file.split("/").map(encodeURIComponent).join("/");
        const cdn = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${encodeURIComponent(branch)}/${encoded}`;
        const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encoded}`;
        const text = (await fetchText(cdn, controller.signal)) || (await fetchText(raw, controller.signal));
        if (text) {
          found[file] = text;
        }
      })
    );
    const next = { ...locales };
    if (found["README.zh-CN.md"] || found["README.zh.md"]) {
      next.zh = found["README.zh-CN.md"] || found["README.zh.md"];
    }
    if (found["README.en.md"]) {
      next.en = found["README.en.md"];
    }
    if (found["README.md"]) {
      next.default = found["README.md"];
    }
    return {
      ...plugin,
      readmeLocales: next,
      readmeMarkdown: next.default || next.zh || next.en || "",
    };
  } catch {
    return plugin;
  } finally {
    clearTimeout(timer);
  }
}
