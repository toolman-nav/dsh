const BASE_URL = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
const DATA_URL = `${BASE_URL}data/`;

let indexPromise;
let metaPromise;
let homePromise;

async function loadJson(path) {
  const response = await fetch(`${DATA_URL}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function loadIndex() {
  if (!indexPromise) {
    indexPromise = loadJson("catalog-index.json").then((data) => ({
      plugins: Array.isArray(data.plugins) ? data.plugins : [],
    }));
  }
  return indexPromise;
}

function compareIso(a, b) {
  return String(b || "").localeCompare(String(a || ""));
}

function matches(plugin, { q, capability, kind, featured, includeAll }) {
  if (!includeAll && !plugin.pluginLike) return false;
  if (featured && !plugin.featured) return false;
  if (capability && plugin.capability !== capability) return false;
  if (kind && plugin.kind !== kind) return false;
  const query = String(q || "").trim().toLowerCase();
  if (!query) return true;
  return [plugin.id, plugin.owner, plugin.name, plugin.description, plugin.topics, plugin.capability, plugin.kind]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function sortPlugins(plugins, sort) {
  const copy = [...plugins];
  if (sort === "stars") {
    copy.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  } else if (sort === "new") {
    copy.sort((a, b) => compareIso(a.createdAt, b.createdAt));
  } else {
    copy.sort((a, b) => compareIso(a.updatedAt, b.updatedAt));
  }
  return copy;
}

export function catalogMeta() {
  if (!metaPromise) metaPromise = loadJson("meta.json");
  return metaPromise;
}

export function catalogHome() {
  if (!homePromise) homePromise = loadJson("home.json");
  return homePromise;
}

export async function catalogSearch({
  q = "",
  capability = "",
  kind = "",
  featured = false,
  includeAll = false,
  sort = "updated",
  page = 0,
  size = 24,
} = {}) {
  const { plugins } = await loadIndex();
  const matched = sortPlugins(
    plugins.filter((plugin) => matches(plugin, { q, capability, kind, featured, includeAll })),
    sort
  );
  const safePage = Math.max(0, Number(page) || 0);
  const safeSize = Math.max(1, Number(size) || 24);
  const start = safePage * safeSize;
  const content = matched.slice(start, start + safeSize);
  return {
    content,
    totalElements: matched.length,
    number: safePage,
    size: safeSize,
    last: start + content.length >= matched.length,
  };
}

export async function catalogDetail(owner, name) {
  const path = `plugins/${encodeURIComponent(String(owner || ""))}/${encodeURIComponent(String(name || ""))}.json`;
  try {
    return await loadJson(path);
  } catch (error) {
    if (String(error?.message).includes("HTTP 404")) return null;
    throw error;
  }
}
