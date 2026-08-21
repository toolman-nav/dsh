const CATALOG_URL = `${String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")}catalog.json`;

let catalogPromise;

function compareIso(a, b) {
  return String(b || "").localeCompare(String(a || ""));
}

function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(CATALOG_URL).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return {
        lastCrawledAt: data.lastCrawledAt || "",
        plugins: Array.isArray(data.plugins) ? data.plugins : [],
      };
    });
  }
  return catalogPromise;
}

function matches(plugin, { q, capability, kind, featured, includeAll }) {
  if (!includeAll && !plugin.pluginLike) {
    return false;
  }
  if (featured && !plugin.featured) {
    return false;
  }
  if (capability && plugin.capability !== capability) {
    return false;
  }
  if (kind && plugin.kind !== kind) {
    return false;
  }
  const query = String(q || "").trim().toLowerCase();
  if (!query) {
    return true;
  }
  const hay = [
    plugin.id,
    plugin.owner,
    plugin.name,
    plugin.description,
    plugin.topics,
    plugin.capability,
    plugin.kind,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
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

export async function catalogMeta() {
  const { lastCrawledAt, plugins } = await loadCatalog();
  return {
    lastCrawledAt,
    total: plugins.filter((p) => p.pluginLike).length,
    topicTotal: plugins.length,
  };
}

export async function catalogHome() {
  const { lastCrawledAt, plugins } = await loadCatalog();
  const liked = plugins.filter((p) => p.pluginLike);
  let featured = sortPlugins(
    plugins.filter((p) => p.featured),
    "stars"
  ).slice(0, 6);
  if (!featured.length) {
    featured = sortPlugins(liked, "stars").slice(0, 6);
  }
  return {
    lastCrawledAt,
    total: liked.length,
    topicTotal: plugins.length,
    featured,
    newest: sortPlugins(liked, "updated").slice(0, 6),
    popular: sortPlugins(liked, "stars").slice(0, 6),
  };
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
  const { plugins } = await loadCatalog();
  const matched = sortPlugins(
    plugins.filter((p) => matches(p, { q, capability, kind, featured, includeAll })),
    sort
  );
  const start = Math.max(0, page) * size;
  const content = matched.slice(start, start + size);
  const totalElements = matched.length;
  const last = start + content.length >= totalElements;
  return {
    content,
    totalElements,
    number: page,
    size,
    last,
  };
}

export async function catalogDetail(owner, name) {
  const id = `${decodeURIComponent(owner)}/${decodeURIComponent(name)}`;
  const { plugins } = await loadCatalog();
  return plugins.find((p) => p.id === id) || null;
}
