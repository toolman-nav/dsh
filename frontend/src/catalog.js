const BASE_URL = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

let catalogPromise;
let indexPromise;
let metaPromise;
let homePromise;

async function tryJson(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const type = response.headers.get("content-type") || "";
    if (!response.ok || !type.includes("json")) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

function likePlugins(plugins) {
  return (Array.isArray(plugins) ? plugins : []).filter((plugin) => plugin.pluginLike);
}

function compareIso(a, b) {
  return String(b || "").localeCompare(String(a || ""));
}

async function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = tryJson("catalog.json").then((data) => {
      if (!data || !Array.isArray(data.plugins)) {
        throw new Error("catalog.json missing");
      }
      return data;
    });
  }
  return catalogPromise;
}

function loadIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const sharded = await tryJson("data/catalog-index.json");
      if (sharded && Array.isArray(sharded.plugins)) {
        return { plugins: sharded.plugins };
      }
      const catalog = await loadCatalog();
      return { plugins: catalog.plugins };
    })();
  }
  return indexPromise;
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

function homeFromCatalog(catalog) {
  const plugins = likePlugins(catalog.plugins);
  const featured = plugins.filter((plugin) => plugin.featured).slice(0, 12);
  const newest = [...plugins].sort((a, b) => compareIso(a.updatedAt, b.updatedAt)).slice(0, 12);
  const popular = [...plugins].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 12);
  return {
    featured: featured.length ? featured : popular.slice(0, 12),
    newest,
    popular,
    total: plugins.length,
    lastCrawledAt: catalog.lastCrawledAt || "",
  };
}

export function catalogMeta() {
  if (!metaPromise) {
    metaPromise = (async () => {
      const sharded = await tryJson("data/meta.json");
      if (sharded) return sharded;
      const catalog = await loadCatalog();
      const plugins = catalog.plugins || [];
      return {
        lastCrawledAt: catalog.lastCrawledAt || "",
        total: likePlugins(plugins).length,
        topicTotal: plugins.length,
      };
    })();
  }
  return metaPromise;
}

export function catalogHome() {
  if (!homePromise) {
    homePromise = (async () => {
      const sharded = await tryJson("data/home.json");
      if (sharded && Array.isArray(sharded.featured)) return sharded;
      return homeFromCatalog(await loadCatalog());
    })();
  }
  return homePromise;
}

const BROWSE_SORTS = new Set(["updated", "stars", "new"]);
const PAGE_SIZE = 24;

function canUseBrowsePage({ q, capability, kind, includeAll, sort, size }) {
  return (
    !String(q || "").trim() &&
    !capability &&
    !kind &&
    !includeAll &&
    BROWSE_SORTS.has(sort || "updated") &&
    Number(size || PAGE_SIZE) === PAGE_SIZE
  );
}

function browsePagePath(sort, featured, page) {
  return `data/pages/${sort || "updated"}${featured ? "-featured" : ""}-${page}.json`;
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
  const safePage = Math.max(0, Number(page) || 0);
  const safeSize = Math.max(1, Number(size) || PAGE_SIZE);
  if (canUseBrowsePage({ q, capability, kind, includeAll, sort, size: safeSize })) {
    const paged = await tryJson(browsePagePath(sort, featured, safePage));
    if (paged && Array.isArray(paged.content)) {
      return paged;
    }
  }
  const { plugins } = await loadIndex();
  const matched = sortPlugins(
    plugins.filter((plugin) => matches(plugin, { q, capability, kind, featured, includeAll })),
    sort
  );
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
  const expected = `${owner}/${name}`;
  const sharded = await tryJson(
    `data/plugins/${encodeURIComponent(String(owner || ""))}/${encodeURIComponent(String(name || ""))}.json`
  );
  if (sharded) return sharded;
  const { plugins } = await loadIndex();
  return (
    plugins.find(
      (plugin) =>
        plugin.id === expected || (plugin.owner === owner && String(plugin.name) === String(name))
    ) || null
  );
}
