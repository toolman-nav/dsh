import DOMPurify from "dompurify";
import { Marked } from "marked";
import { t } from "./ui.js";

const AWESOME_BADGE = String.raw`https?:\/\/(?:www\.)?awesome-dsh-plugin\.com\/badge\.svg[^)\s"']*`;
const AWESOME_ALT = String.raw`(?:Awesome\s+DSH\s+Plugin|awesome\s*[·•]?\s*DSH\s*plugin)`;
const LANG_NAME = String.raw`简体中文|繁體中文|繁体中文|中文|English|日本語|한국어|Français|Deutsch|Español|Português`;

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function githubBlobToRaw(url) {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/);
  if (!match) {
    return url;
  }
  return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
}

function rewriteHref(href, plugin) {
  if (!href) {
    return "";
  }
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("data:") ||
    href.startsWith("#") ||
    href.startsWith("mailto:")
  ) {
    return githubBlobToRaw(href);
  }
  const repo = githubRepo(plugin);
  const path = resolveRepoPath(href, repo.basePath);
  const branch = plugin.defaultBranch || repo.branch || "main";
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${branch}/${path}`;
}

function githubRepo(plugin) {
  const url = String(plugin.htmlUrl || "");
  const tree = url.match(/github\.com\/([^/]+)\/([^/#?]+)\/(?:tree|blob)\/([^/]+)/i);
  if (tree) {
    return { owner: tree[1], name: tree[2], branch: tree[3], basePath: "" };
  }
  const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (match) {
    return { owner: match[1], name: match[2], branch: plugin.defaultBranch || "main", basePath: "" };
  }
  const name = String(plugin.name || "").split("#")[0];
  return { owner: plugin.owner, name, branch: plugin.defaultBranch || "main", basePath: "" };
}

function resolveRepoPath(href, basePath) {
  const trimmed = String(href || "").trim();
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/^\/+/, "");
  }
  const stack = basePath ? basePath.split("/").filter(Boolean) : [];
  for (const part of trimmed.replace(/^\.\//, "").split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join("/");
}

function fencedCodeHtml(text, lang, escaped) {
  const langString = String(lang || "").trim().split(/\s+/)[0];
  const code = `${String(text ?? "").replace(/\n$/, "")}\n`;
  const body = escaped ? code : escapeAttr(code);
  const cls = langString ? ` class="language-${escapeAttr(langString)}"` : "";
  return `${codeBlockWrap(`<pre><code${cls}>${body}</code></pre>`)}\n`;
}

function codeBlockWrap(preHtml) {
  const label = t("复制", "Copy");
  return `<div class="readme-code"><button type="button" class="readme-copy" aria-label="${label}" title="${label}"></button>${preHtml}</div>`;
}

function wrapLoosePreBlocks(html) {
  return html.replace(
    /<div class="readme-code">[\s\S]*?<\/div>|<pre\b[\s\S]*?<\/pre>/gi,
    (block) => (block.startsWith("<div") ? block : codeBlockWrap(block))
  );
}

function rewriteHtmlImages(html, plugin) {
  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    const srcMatch = attrs.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!srcMatch) {
      return full;
    }
    const src = srcMatch[1] ?? srcMatch[2] ?? srcMatch[3] ?? "";
    const next = rewriteHref(src, plugin);
    const nextAttrs = attrs.replace(srcMatch[0], ` src="${escapeAttr(next)}"`);
    return `<img${nextAttrs}>`;
  });
}

function decodeEntities(text) {
  return String(text ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function visibleText(block) {
  return decodeEntities(block)
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, (match) => match.slice(1, match.indexOf("]")))
    .replace(/[*_~`#>]/g, " ")
    .replace(/🌐|🗣️|🏳️/g, " ")
    .replace(/(?:语言|Language)\s*(?:\/\s*(?:语言|Language))?\s*:?/gi, " ")
    .replace(/[|·•,/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLanguageSwitcher(block) {
  const plain = visibleText(block);
  if (!plain) {
    return false;
  }
  const tokens = plain.split(" ").filter(Boolean);
  if (tokens.length < 2 || tokens.length > 8) {
    return false;
  }
  const lang = new RegExp(`^(?:${LANG_NAME})$`, "i");
  return tokens.every((token) => lang.test(token));
}

function isMarkdownTableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.includes("|", 1);
}

export function stripReadmeChrome(markdown) {
  let text = String(markdown ?? "").replace(/\r\n/g, "\n");

  text = text.replace(
    new RegExp(String.raw`\[!\[(?:[^\]]*)\]\(\s*${AWESOME_BADGE}\s*\)\]\([^)]*\)`, "gi"),
    ""
  );
  text = text.replace(
    new RegExp(String.raw`!?\[${AWESOME_ALT}\]\([^)]*\)`, "gi"),
    ""
  );
  text = text.replace(
    new RegExp(String.raw`!\[(?:[^\]]*)\]\(\s*${AWESOME_BADGE}\s*\)`, "gi"),
    ""
  );
  text = text.replace(
    /<a\b[^>]*awesome-dsh-plugin\.com[^>]*>\s*<img\b[^>]*awesome-dsh-plugin\.com\/badge\.svg[^>]*>\s*<\/a>/gi,
    ""
  );
  text = text.replace(/<img\b[^>]*awesome-dsh-plugin\.com\/badge\.svg[^>]*>/gi, "");
  text = text.replace(/<a\b[^>]*awesome-dsh-plugin\.com[^>]*>\s*<\/a>/gi, "");

  text = text.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (block) => (isLanguageSwitcher(block) ? "" : block));
  text = text
    .split("\n")
    .map((line) => (isMarkdownTableLine(line) || !isLanguageSwitcher(line) ? line : ""))
    .join("\n");

  return text
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+/, "");
}

export function renderReadme(markdown, plugin) {
  const cleaned = stripReadmeChrome(markdown);
  if (!cleaned) {
    return "";
  }
  const marked = new Marked({
    gfm: true,
    renderer: {
      code({ text, lang, escaped }) {
        return fencedCodeHtml(text, lang, escaped);
      },
      image({ href, title, text }) {
        const src = rewriteHref(href, plugin);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<img src="${escapeAttr(src)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy">`;
      },
      link({ href, title, text, tokens }) {
        const src = rewriteHref(href, plugin);
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        const label = tokens && this.parser ? this.parser.parseInline(tokens) : (text ?? "");
        return `<a href="${escapeAttr(src)}" rel="noreferrer" target="_blank"${titleAttr}>${label}</a>`;
      },
    },
  });
  const html = wrapLoosePreBlocks(rewriteHtmlImages(marked.parse(cleaned), plugin));
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["button"],
    ADD_ATTR: ["target", "align", "valign", "width", "height", "border", "colspan", "rowspan", "type", "aria-label", "title"],
  });
}
