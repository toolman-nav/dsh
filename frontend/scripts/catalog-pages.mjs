export const PAGE_SIZE = 24;
export const BROWSE_SORTS = ["updated", "stars", "new"];

function compareIso(a, b) {
  return String(b || "").localeCompare(String(a || ""));
}

export function sortPlugins(plugins, sort) {
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

export function paginate(plugins, size = PAGE_SIZE) {
  const total = plugins.length;
  const pageCount = Math.max(1, Math.ceil(total / size) || 1);
  const pages = [];
  for (let i = 0; i < pageCount; i += 1) {
    const content = plugins.slice(i * size, i * size + size);
    pages.push({
      content,
      totalElements: total,
      number: i,
      size,
      last: i * size + content.length >= total,
    });
  }
  return pages;
}

export function browseKey(sort, featured) {
  return `${sort}${featured ? "-featured" : ""}`;
}

export function buildBrowsePages(plugins, size = PAGE_SIZE) {
  const like = (Array.isArray(plugins) ? plugins : []).filter((plugin) => plugin.pluginLike);
  const featured = like.filter((plugin) => plugin.featured);
  const pages = {};
  for (const sort of BROWSE_SORTS) {
    pages[browseKey(sort, false)] = paginate(sortPlugins(like, sort), size);
    pages[browseKey(sort, true)] = paginate(sortPlugins(featured, sort), size);
  }
  return pages;
}
