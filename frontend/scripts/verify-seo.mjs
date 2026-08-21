import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CAPABILITIES } from "../src/taxonomy.js";

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
