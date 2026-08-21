import { reactive } from "vue";

export const ui = reactive({
  theme: localStorage.getItem("bay-theme") || "light",
  lang: localStorage.getItem("bay-lang") || "zh",
  paletteOpen: false,
  toast: "",
});

export function applyTheme() {
  document.documentElement.dataset.theme = ui.theme === "dark" ? "dark" : "light";
  document.documentElement.lang = ui.lang === "en" ? "en" : "zh-CN";
}

export function toggleTheme() {
  ui.theme = ui.theme === "dark" ? "light" : "dark";
  localStorage.setItem("bay-theme", ui.theme);
  applyTheme();
}

export function toggleLang() {
  ui.lang = ui.lang === "zh" ? "en" : "zh";
  localStorage.setItem("bay-lang", ui.lang);
  applyTheme();
}

export function t(zh, en) {
  return ui.lang === "en" ? en : zh;
}

export function showToast(message) {
  ui.toast = message;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    ui.toast = "";
  }, 1600);
}

export async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message || t("已复制安装命令", "Install command copied"));
  } catch {
    showToast(text);
  }
}

export function formatStars(n) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n ?? 0);
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function pickReadme(plugin, chinese) {
  const locales = plugin?.readmeLocales || {};
  if (chinese) {
    return locales.zh || locales["zh-CN"] || locales["zh-TW"] || locales.default || plugin?.readmeMarkdown || "";
  }
  return locales.en || locales.default || plugin?.readmeMarkdown || "";
}

export function pluginHref(plugin) {
  const id = plugin?.id || `${plugin?.owner || ""}/${plugin?.name || ""}`;
  const slash = id.indexOf("/");
  const owner = slash < 0 ? id : id.slice(0, slash);
  const rest = slash < 0 ? "" : id.slice(slash + 1);
  return `/plugins/${encodeURIComponent(owner)}/${encodeURIComponent(rest)}`;
}

export function pluginTitle(plugin) {
  const name = String(plugin?.name || "");
  if (name.includes("#")) {
    const rest = name.slice(name.indexOf("#") + 1);
    const last = rest.split("/").filter(Boolean).pop();
    if (last) {
      return last;
    }
  }
  if (name) {
    return name;
  }
  const id = String(plugin?.id || "");
  const slash = id.lastIndexOf("/");
  const tail = slash >= 0 ? id.slice(slash + 1) : id;
  return tail.replaceAll("--", "/");
}

export function pluginFullLabel(plugin) {
  const owner = plugin?.owner || "";
  const title = pluginTitle(plugin);
  return owner ? `${owner}/${title}` : title;
}

export function plainText(value) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

applyTheme();
