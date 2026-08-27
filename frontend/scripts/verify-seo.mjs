import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CAPABILITIES } from "../src/taxonomy.js";
import { HOME_DESCRIPTION, HOME_HEADING, HOME_KEYWORDS, HOME_TITLE } from "../src/seo.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const outDir = resolve(outArg >= 0 && process.argv[outArg + 1] ? process.argv[outArg + 1] : resolve(projectRoot, "dist"));
const generatedIndex = JSON.parse(readFileSync(resolve(outDir, "data", "catalog-index.json"), "utf8"));
const allPlugins = Array.isArray(generatedIndex.plugins) ? generatedIndex.plugins : [];
const plugins = allPlugins.filter((plugin) => plugin.pluginLike);

function pluginSegments(plugin) {
  const id = String(plugin.id || `${plugin.owner || ""}/${plugin.name || ""}`);
  const slash = id.indexOf("/");
  return [encodeURIComponent(slash < 0 ? plugin.owner : id.slice(0, slash)), encodeURIComponent(slash < 0 ? plugin.name : id.slice(slash + 1))];
}

function countPluginPages() {
  const root = resolve(outDir, "plugins");
  let count = 0;
  for (const owner of readdirSync(root, { withFileTypes: true })) {
    if (!owner.isDirectory()) continue;
    for (const plugin of readdirSync(resolve(root, owner.name), { withFileTypes: true })) {
      if (plugin.isDirectory() && existsSync(resolve(root, owner.name, plugin.name, "index.html"))) count++;
    }
  }
  return count;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sample = plugins[0];
assert(sample, "Catalog contains no plugin-like entries");
const [owner, name] = pluginSegments(sample);
const sampleHtmlPath = resolve(outDir, "plugins", owner, name, "index.html");
const sampleDataPath = resolve(outDir, "data", "plugins", owner, `${name}.json`);
assert(existsSync(sampleHtmlPath), `Missing sample HTML: ${sampleHtmlPath}`);
assert(existsSync(sampleDataPath), `Missing sample data: ${sampleDataPath}`);

const html = readFileSync(sampleHtmlPath, "utf8");
const sampleData = JSON.parse(readFileSync(sampleDataPath, "utf8"));
const canonical = html.match(/rel="canonical" href="([^"]+)/)?.[1];
const schemaText = html.match(/id="seo-jsonld" type="application\/ld\+json">([^<]+)/)?.[1];
assert(canonical, "Sample page has no canonical URL");
assert(schemaText, "Sample page has no JSON-LD");
const schema = JSON.parse(schemaText);
assert(schema["@type"] === "SoftwareSourceCode", "Sample schema type is not SoftwareSourceCode");
assert(schema.codeRepository === sampleData.htmlUrl, "Sample schema repository does not match catalog data");
assert(html.includes(`<h1>${sample.id}</h1>`), "Sample page has no matching H1");
assert(html.includes('<meta id="seo-description"'), "Sample page has no description meta");

const noise = allPlugins.find((plugin) => !plugin.pluginLike);
if (noise) {
  const [noiseOwner, noiseName] = pluginSegments(noise);
  const noiseHtml = readFileSync(resolve(outDir, "plugins", noiseOwner, noiseName, "index.html"), "utf8");
  assert(noiseHtml.includes('name="robots" content="noindex,follow"'), "Non-plugin topic page should be noindex,follow");
}

const sitemap = readFileSync(resolve(outDir, "sitemap.xml"), "utf8");
const robots = readFileSync(resolve(outDir, "robots.txt"), "utf8");
const llms = readFileSync(resolve(outDir, "llms.txt"), "utf8");
const llmsFull = readFileSync(resolve(outDir, "llms-full.txt"), "utf8");
const sitemapUrls = sitemap.match(/<url>/g)?.length || 0;
const llmsEntries = llms.match(/^- \[/gm)?.length || 0;
const llmsFullEntries = llmsFull.match(/^- \[/gm)?.length || 0;
const pageCount = countPluginPages();

assert(sitemapUrls === plugins.length + 3, `Sitemap URL count mismatch: ${sitemapUrls}`);
assert(sitemap.includes(canonical), "Sitemap is missing the sample canonical URL");
assert(robots.includes("Sitemap: https://dshpluginlist.com/sitemap.xml"), "robots.txt is missing the sitemap directive");
assert(robots.includes("User-agent: OAI-SearchBot"), "robots.txt is missing OAI-SearchBot");
assert(llmsEntries === Math.min(100, plugins.length), "llms.txt entry count mismatch");
assert(llmsFullEntries === plugins.length, "llms-full.txt entry count mismatch");
assert(pageCount === allPlugins.length, `Plugin HTML page count mismatch: ${pageCount}`);
const unsupportedCapabilities = [...new Set(allPlugins.map((plugin) => plugin.capability).filter((capability) => !CAPABILITIES.includes(capability)))];
assert(unsupportedCapabilities.length === 0, `Unsupported capabilities: ${unsupportedCapabilities.join(", ")}`);
assert(!existsSync(resolve(outDir, "catalog.json")), "Legacy catalog.json should not be deployed");
assert(existsSync(resolve(outDir, "404.html")), "Missing static 404.html");

function hasKeywordsMeta(pageHtml) {
  return /<meta\b(?=[^>]*\bname\s*=\s*(["'])keywords\1)[^>]*>/i.test(pageHtml);
}

const sourceIndex = readFileSync(resolve(projectRoot, "index.html"), "utf8");
assert(sourceIndex.includes(`<title>${HOME_TITLE}</title>`), "Source index.html title drifted from HOME_TITLE");
assert(sourceIndex.includes(`name="keywords" content="${HOME_KEYWORDS}"`), "Source index.html keywords drifted from HOME_KEYWORDS");
assert(sourceIndex.includes(`id="seo-description" name="description" content="${HOME_DESCRIPTION}"`), "Source index.html description drifted from HOME_DESCRIPTION");
assert(sourceIndex.includes(`<h1>${HOME_HEADING}</h1>`), "Source fallback H1 drifted from HOME_HEADING");

const homeHtml = readFileSync(resolve(outDir, "index.html"), "utf8");
const homeTitle = homeHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
const homeKeywords = homeHtml.match(/<meta\b(?=[^>]*\bname\s*=\s*(["'])keywords\1)[^>]*\bcontent="([^"]*)"/i)?.[2]
  || homeHtml.match(/<meta\b[^>]*\bcontent="([^"]*)"[^>]*\bname\s*=\s*(["'])keywords\2/i)?.[1];
const homeDescription = homeHtml.match(/<meta[^>]+name="description"[^>]*content="([^"]*)"/i)?.[1]
  || homeHtml.match(/<meta[^>]+content="([^"]*)"[^>]*id="seo-description"/i)?.[1];
const homeSchemaText = homeHtml.match(/id="seo-jsonld" type="application\/ld\+json">([^<]+)/)?.[1];
assert(homeTitle === HOME_TITLE, `Home title drifted from HOME_TITLE: ${homeTitle}`);
assert(homeHtml.includes(`<h1>${HOME_HEADING}</h1>`), "Home prerender H1 should match HOME_HEADING");
assert(homeKeywords?.includes("DSH插件"), "Home page is missing keywords meta");
assert(homeDescription?.includes(`已收录 ${plugins.length} 个`), `Home description missing plugin count: ${homeDescription}`);
assert(homeDescription?.includes("非官方"), `Home description missing unofficial disclaimer: ${homeDescription}`);
assert(homeDescription?.split("。")[0]?.includes("非官方"), "Unofficial disclaimer should be in the first sentence");
assert(homeHtml.includes(`property="og:title" content="${homeTitle}"`), "Home og:title does not match title");
assert(homeHtml.includes(`property="og:description" content="${homeDescription}"`), "Home og:description does not match meta description");
assert(homeSchemaText, "Home page has no JSON-LD");
const homeSchema = JSON.parse(homeSchemaText);
assert(homeSchema.description === homeDescription, "Home JSON-LD description does not match meta description");
assert(llms.includes(HOME_DESCRIPTION), "llms.txt should use HOME_DESCRIPTION");

const pluginsHtml = readFileSync(resolve(outDir, "plugins", "index.html"), "utf8");
const aboutHtml = readFileSync(resolve(outDir, "about", "index.html"), "utf8");
const notFoundHtml = readFileSync(resolve(outDir, "404.html"), "utf8");
assert(!hasKeywordsMeta(pluginsHtml), "Plugins page should not inherit home keywords");
assert(!hasKeywordsMeta(aboutHtml), "About page should not inherit home keywords");
assert(!hasKeywordsMeta(notFoundHtml), "404 page should not inherit home keywords");
assert(!hasKeywordsMeta(html), "Sample plugin page should not inherit home keywords");

const result = {
  sample: sample.id,
  canonical,
  schemaType: schema["@type"],
  sitemapUrls,
  pluginHtmlPages: pageCount,
  llmsEntries,
  llmsFullEntries,
  catalogIndexBytes: statSync(resolve(outDir, "data", "catalog-index.json")).size,
};
console.log(JSON.stringify(result, null, 2));
