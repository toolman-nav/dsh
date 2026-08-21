import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePlugin } from "../src/taxonomy.js";

const SITE_URL = String(process.env.SITE_URL || "https://dshpluginlist.com").replace(/\/$/, "");
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const outDir = resolve(outArg >= 0 && process.argv[outArg + 1] ? process.argv[outArg + 1] : resolve(projectRoot, "dist"));
const templatePath = resolve(outDir, "index.html");
const catalogPath = resolve(projectRoot, "public/catalog.json");
const template = readFileSync(templatePath, "utf8");

async function loadCatalog() {
  const apiBase = String(process.env.SEO_CATALOG_API_BASE || process.env.VITE_API_BASE || "").replace(/\/$/, "");
  if (!apiBase) {
    return { source: "public/catalog.json", catalog: JSON.parse(readFileSync(catalogPath, "utf8")) };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiBase}/api/catalog`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { source: `${apiBase}/api/catalog`, catalog: await response.json() };
  } finally {
    clearTimeout(timer);
  }
}

const loaded = await loadCatalog();
const catalog = loaded.catalog;
const allPlugins = (Array.isArray(catalog.plugins) ? catalog.plugins : []).map(normalizePlugin);
const plugins = allPlugins.filter((plugin) => plugin.pluginLike);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainText(value) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\*_~#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value, fallback, max = 160) {
  const text = plainText(value) || fallback;
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function pluginPath(plugin) {
  const id = String(plugin.id || `${plugin.owner || ""}/${plugin.name || ""}`);
  const slash = id.indexOf("/");
  const owner = slash < 0 ? String(plugin.owner || "") : id.slice(0, slash);
  const name = slash < 0 ? String(plugin.name || "") : id.slice(slash + 1);
  return `/plugins/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/`;
}

function canonical(path) {
  return new URL(path, `${SITE_URL}/`).toString();
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function replaceTag(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

function applySeo(html, { title, description, path, robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1", type = "website", schema }) {
  const url = canonical(path);
  const image = `${SITE_URL}/logo.png`;
  let next = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  const tags = [
    [/<meta[^>]+name="description"[^>]*>/i, `<meta id="seo-description" name="description" content="${escapeHtml(description)}" />`],
    [/<meta[^>]+name="robots"[^>]*>/i, `<meta id="seo-robots" name="robots" content="${escapeHtml(robots)}" />`],
    [/<link[^>]+rel="canonical"[^>]*>/i, `<link id="seo-canonical" rel="canonical" href="${escapeHtml(url)}" />`],
    [/<meta[^>]+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`],
    [/<meta[^>]+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`],
    [/<meta[^>]+property="og:type"[^>]*>/i, `<meta property="og:type" content="${type}" />`],
    [/<meta[^>]+property="og:url"[^>]*>/i, `<meta property="og:url" content="${escapeHtml(url)}" />`],
    [/<meta[^>]+property="og:image"[^>]*>/i, `<meta property="og:image" content="${image}" />`],
    [/<meta[^>]+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`],
    [/<meta[^>]+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`],
    [/<meta[^>]+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${image}" />`],
    [/<script[^>]+id="seo-jsonld"[^>]*>[\s\S]*?<\/script>/i, `<script id="seo-jsonld" type="application/ld+json">${safeJson(schema)}</script>`],
  ];
  for (const [pattern, replacement] of tags) next = replaceTag(next, pattern, replacement);
  return next;
}

function injectFallback(html, content) {
  const pattern = /<div id="seo-fallback">[\s\S]*?<\/div>/i;
  const fallback = `<div id="seo-fallback">${content}</div>`;
  if (!pattern.test(html)) throw new Error("Missing #seo-fallback in built index.html");
  return html.replace(pattern, fallback);
}

function writePage(relativePath, html) {
  const file = relativePath ? resolve(outDir, relativePath, "index.html") : resolve(outDir, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function listItems(items) {
  return `<ul>${items.map((plugin) => {
    const description = excerpt(plugin.description, "暂无描述", 120);
    return `<li><a href="${pluginPath(plugin)}"><strong>${escapeHtml(plugin.id)}</strong></a> — ${escapeHtml(description)}</li>`;
  }).join("")}</ul>`;
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bay · DSH 插件仓",
    url: `${SITE_URL}/`,
    description: "DeepSeek Harness 社区插件目录。",
    inLanguage: ["zh-CN", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/plugins/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

const byStars = [...plugins].sort((a, b) => (b.stars || 0) - (a.stars || 0));
const byUpdated = [...plugins].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
const featured = byStars.filter((plugin) => plugin.featured).slice(0, 12);
const homeItems = [...new Map([...featured, ...byUpdated.slice(0, 12), ...byStars.slice(0, 12)].map((plugin) => [plugin.id, plugin])).values()];
const homeDescription = `Bay 已收录 ${plugins.length} 个 DeepSeek Harness 社区插件，提供搜索、分类、安装命令与 GitHub 源码信息。`;
let homeHtml = applySeo(template, { title: "Bay · DSH 插件仓｜DeepSeek Harness 社区插件目录", description: homeDescription, path: "/", schema: websiteSchema() });
homeHtml = injectFallback(homeHtml, `<main id="main" class="wrap home"><section class="hero panel"><h1>DSH 插件仓</h1><p>${escapeHtml(homeDescription)}</p><p>目录更新：<time datetime="${escapeHtml(catalog.lastCrawledAt || "")}">${escapeHtml(catalog.lastCrawledAt || "未知")}</time></p><p><a href="/plugins/">浏览全部插件</a> · <a href="/about/">收录规则与安全说明</a></p></section><section><h2>精选与近期更新</h2>${listItems(homeItems)}</section></main>`);
writePage("", homeHtml);

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "DSH 插件目录",
  url: `${SITE_URL}/plugins/`,
  description: `包含 ${plugins.length} 个 DeepSeek Harness 社区插件。`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: plugins.length,
    itemListElement: byStars.slice(0, 100).map((plugin, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: canonical(pluginPath(plugin)),
      name: plugin.id,
    })),
  },
};
let pluginsHtml = applySeo(template, { title: "DSH 插件目录｜Bay", description: `浏览和搜索 ${plugins.length} 个 DeepSeek Harness 社区插件。`, path: "/plugins/", schema: collectionSchema });
pluginsHtml = injectFallback(pluginsHtml, `<main id="main" class="wrap"><h1>DSH 插件目录</h1><p>共收录 ${plugins.length} 个社区插件。启用 JavaScript 后可按能力、类型、Stars 和更新时间筛选。</p>${listItems(byStars.slice(0, 200))}</main>`);
writePage("plugins", pluginsHtml);

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "关于 Bay DSH 插件仓",
  url: `${SITE_URL}/about/`,
  isPartOf: { "@type": "WebSite", name: "Bay · DSH 插件仓", url: `${SITE_URL}/` },
};
let aboutHtml = applySeo(template, { title: "关于 Bay DSH 插件仓", description: "了解 Bay 的插件来源、收录规则、更新时间和第三方插件安全说明。", path: "/about/", schema: aboutSchema });
aboutHtml = injectFallback(aboutHtml, `<main id="main" class="wrap about-block"><h1>关于 Bay DSH 插件仓</h1><p>Bay 是非官方社区目录，聚合社区可安装插件清单，并使用 GitHub dsh-plugin 话题补充数据。</p><h2>数据与更新</h2><p>当前收录 ${plugins.length} 个插件，最后抓取时间为 ${escapeHtml(catalog.lastCrawledAt || "未知")}。</p><h2>安全说明</h2><p>Bay 不审核、不担保、也不执行第三方代码。安装前请检查源码、权限、维护状态与许可证。</p></main>`);
writePage("about", aboutHtml);

const dataDir = resolve(outDir, "data");
mkdirSync(dataDir, { recursive: true });
const meta = { lastCrawledAt: catalog.lastCrawledAt || "", total: plugins.length, topicTotal: allPlugins.length };
const home = { ...meta, featured: featured.slice(0, 6), newest: byUpdated.slice(0, 6), popular: byStars.slice(0, 6) };
const indexKeys = ["id", "owner", "name", "description", "stars", "updatedAt", "createdAt", "topics", "capability", "kind", "featured", "pluginLike", "installCommand"];
const catalogIndex = allPlugins.map((plugin) => Object.fromEntries(indexKeys.map((key) => [key, plugin[key]])));
writeFileSync(resolve(dataDir, "meta.json"), JSON.stringify(meta));
writeFileSync(resolve(dataDir, "home.json"), JSON.stringify(home));
writeFileSync(resolve(dataDir, "catalog-index.json"), JSON.stringify({ plugins: catalogIndex }));

for (const plugin of allPlugins) {
  const path = pluginPath(plugin);
  const relative = path.replace(/^\//, "").replace(/\/$/, "");
  const description = excerpt(plugin.description, `${plugin.id} 是一个 DeepSeek Harness 社区插件，查看安装命令、源码与更新时间。`);
  const topics = String(plugin.topics || "").split(",").map((item) => item.trim()).filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: plugin.id,
    description,
    url: canonical(path),
    codeRepository: plugin.htmlUrl,
    programmingLanguage: plugin.language || undefined,
    license: plugin.license ? `https://spdx.org/licenses/${encodeURIComponent(plugin.license)}.html` : undefined,
    dateCreated: plugin.createdAt || undefined,
    dateModified: plugin.updatedAt || undefined,
    keywords: topics.length ? topics.join(", ") : undefined,
    author: { "@type": "Person", name: plugin.owner, url: `https://github.com/${encodeURIComponent(plugin.owner)}` },
    isPartOf: { "@type": "WebSite", name: "Bay · DSH 插件仓", url: `${SITE_URL}/` },
  };
  let html = applySeo(template, {
    title: `${plugin.id}｜DSH 插件｜Bay`,
    description,
    path,
    robots: plugin.pluginLike ? undefined : "noindex,follow",
    type: "article",
    schema,
  });
  const topicHtml = topics.length ? `<p><strong>主题：</strong>${topics.map(escapeHtml).join("、")}</p>` : "";
  html = injectFallback(html, `<main id="main" class="wrap detail"><article><p><a href="/plugins/">插件目录</a> / ${escapeHtml(plugin.owner)}</p><h1>${escapeHtml(plugin.id)}</h1><p>${escapeHtml(description)}</p><h2>安装</h2><pre><code>${escapeHtml(plugin.installCommand || "")}</code></pre><h2>项目信息</h2><p>Stars：${Number(plugin.stars || 0)} · 能力：${escapeHtml(plugin.capability || "未知")} · 类型：${escapeHtml(plugin.kind || "未知")} · 更新：${escapeHtml(plugin.updatedAt || "未知")}</p>${topicHtml}<p><a href="${escapeHtml(plugin.htmlUrl || "#")}" rel="noreferrer">查看 GitHub 源码</a></p></article></main>`);
  writePage(relative, html);

  const id = String(plugin.id || "");
  const slash = id.indexOf("/");
  const owner = slash < 0 ? String(plugin.owner || "") : id.slice(0, slash);
  const name = slash < 0 ? String(plugin.name || "") : id.slice(slash + 1);
  const dataFile = resolve(dataDir, "plugins", encodeURIComponent(owner), `${encodeURIComponent(name)}.json`);
  mkdirSync(dirname(dataFile), { recursive: true });
  writeFileSync(dataFile, JSON.stringify(plugin));
}

const lastmod = String(catalog.lastCrawledAt || "").slice(0, 10);
const sitemapEntries = ["/", "/plugins/", "/about/", ...plugins.map(pluginPath)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((path) => `  <url><loc>${escapeHtml(canonical(path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`;
writeFileSync(resolve(outDir, "sitemap.xml"), sitemap);

const robots = `User-agent: *\nAllow: /\nDisallow: /api/admin/\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
writeFileSync(resolve(outDir, "robots.txt"), robots);

const llmsHeader = `# Bay · DSH 插件仓\n\n> DeepSeek Harness 非官方社区插件目录。提供插件搜索、分类、安装命令、GitHub 源码和更新时间。\n\n- 网站：${SITE_URL}/\n- 插件目录：${SITE_URL}/plugins/\n- 关于与安全说明：${SITE_URL}/about/\n- Sitemap：${SITE_URL}/sitemap.xml\n- 数据更新时间：${catalog.lastCrawledAt || "未知"}\n\n## 推荐与热门插件\n`;
const llmsRows = byStars.slice(0, 100).map((plugin) => `- [${plugin.id}](${canonical(pluginPath(plugin))}): ${excerpt(plugin.description, "暂无描述", 240)}`).join("\n");
const llmsFullRows = plugins.map((plugin) => `- [${plugin.id}](${canonical(pluginPath(plugin))}): ${excerpt(plugin.description, "暂无描述", 320)}`).join("\n");
writeFileSync(resolve(outDir, "llms.txt"), `${llmsHeader}${llmsRows}\n`);
writeFileSync(resolve(outDir, "llms-full.txt"), `${llmsHeader.replace("推荐与热门插件", "完整插件目录")}${llmsFullRows}\n`);

let notFoundHtml = applySeo(template, { title: "页面不存在｜Bay", description: "这个地址没有对应的插件或页面。", path: "/404.html", robots: "noindex,nofollow", schema: websiteSchema() });
notFoundHtml = injectFallback(notFoundHtml, `<main id="main" class="wrap about-block"><p>404</p><h1>页面不存在</h1><p>这个地址没有对应的插件或页面。</p><p><a href="/plugins/">返回插件目录</a></p></main>`);
writeFileSync(resolve(outDir, "404.html"), notFoundHtml);

rmSync(resolve(outDir, "catalog.json"), { force: true });
console.log(`Prerendered ${allPlugins.length} plugin pages and ${plugins.length} sitemap entries from ${loaded.source} in ${outDir}`);
