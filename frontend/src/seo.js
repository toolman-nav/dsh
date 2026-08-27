const SITE_NAME = "Bay · DSH 插件仓";
const DEFAULT_SITE_URL = "https://dshpluginlist.com";

export const HOME_HEADING = "DeepSeek Harness 插件目录";
export const HOME_TITLE = `${HOME_HEADING}｜Bay DSH 插件仓`;
export const HOME_KEYWORDS = "DeepSeek Harness插件,DSH插件,dsh-plugin,Harness插件目录,DeepSeek插件安装,Bay插件仓";
const HOME_DESCRIPTION_TAIL = "搜索 dsh-plugin 话题仓库，按能力分类浏览，复制安装命令并查看 GitHub 源码。";
export const HOME_DESCRIPTION = `Bay 是 DeepSeek Harness（DSH）非官方社区插件目录。${HOME_DESCRIPTION_TAIL}`;
const DEFAULT_DESCRIPTION = HOME_DESCRIPTION;
const COUNTED_HOME_DESCRIPTION_RE = /已收录\s+(\d+)\s+个/;

export function homeDescription(total) {
  const count = Number(total);
  if (!Number.isFinite(count) || count <= 0) {
    return HOME_DESCRIPTION;
  }
  return `Bay 已收录 ${count} 个 DeepSeek Harness（DSH）非官方社区插件。${HOME_DESCRIPTION_TAIL}`;
}

function readMetaDescription() {
  if (typeof document === "undefined") return "";
  return document.head.querySelector('meta[name="description"]')?.getAttribute("content") || "";
}

function countedHomeTotal(description = readMetaDescription()) {
  const matched = String(description).match(COUNTED_HOME_DESCRIPTION_RE);
  return matched ? Number(matched[1]) : 0;
}

export const SITE_URL = String(import.meta.env?.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${SITE_URL}/`).toString();
}

function setMeta(selector, attributes) {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
}

function setCanonical(href) {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setJsonLd(value) {
  if (typeof document === "undefined") return;
  let element = document.getElementById("seo-jsonld");
  if (!element) {
    element = document.createElement("script");
    element.id = "seo-jsonld";
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(value);
}

export function setSeo({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path = "/",
  robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  type = "website",
  image = "/logo.png",
  jsonLd,
} = {}) {
  if (typeof document === "undefined") return;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  document.title = title;
  setCanonical(canonical);
  setMeta('meta[name="description"]', { name: "description", content: description });
  if (keywords) {
    setMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
  } else {
    document.head.querySelector('meta[name="keywords"]')?.remove();
  }
  setMeta('meta[name="robots"]', { name: "robots", content: robots });
  setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  setMeta('meta[property="og:title"]', { property: "og:title", content: title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: description });
  setMeta('meta[property="og:type"]', { property: "og:type", content: type });
  setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  setMeta('meta[property="og:locale"]', { property: "og:locale", content: "zh_CN" });
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" });
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
  setJsonLd(jsonLd || websiteJsonLd());
}

export function websiteJsonLd(description = DEFAULT_DESCRIPTION) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description,
    inLanguage: ["zh-CN", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/plugins/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function setHomeSeo(total, extra = {}) {
  const description = homeDescription(total);
  setSeo({
    title: HOME_TITLE,
    description,
    keywords: HOME_KEYWORDS,
    path: "/",
    jsonLd: websiteJsonLd(description),
    ...extra,
  });
}

export function collectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DSH 插件目录",
    url: `${SITE_URL}/plugins/`,
    description: "可搜索和筛选的 DeepSeek Harness 社区插件目录。",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
    inLanguage: ["zh-CN", "en"],
  };
}

export function pluginJsonLd(plugin, canonicalPath, description) {
  const topics = String(plugin?.topics || "").split(",").map((item) => item.trim()).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: plugin?.id || plugin?.name,
    description,
    url: absoluteUrl(canonicalPath),
    codeRepository: plugin?.htmlUrl,
    programmingLanguage: plugin?.language || undefined,
    license: plugin?.license ? `https://spdx.org/licenses/${encodeURIComponent(plugin.license)}.html` : undefined,
    dateCreated: plugin?.createdAt || undefined,
    dateModified: plugin?.updatedAt || undefined,
    keywords: topics.length ? topics.join(", ") : undefined,
    author: plugin?.owner ? {
      "@type": "Person",
      name: plugin.owner,
      url: `https://github.com/${encodeURIComponent(plugin.owner)}`,
    } : undefined,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
  };
}

export function routeSeo(route) {
  if (route.name === "plugin") return;
  const hasQuery = Object.keys(route.query || {}).length > 0;
  const robots = route.name === "not-found"
    ? "noindex,nofollow"
    : hasQuery
      ? "noindex,follow"
      : undefined;
  if (route.name === "home") {
    setHomeSeo(countedHomeTotal(), { robots });
    return;
  }
  setSeo({
    title: route.meta?.title,
    description: route.meta?.description,
    keywords: route.meta?.keywords,
    path: route.meta?.canonicalPath || route.path,
    robots,
    jsonLd: route.name === "plugins" ? collectionJsonLd() : websiteJsonLd(),
  });
}
