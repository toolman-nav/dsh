<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { fetchMeta, fetchPlugins } from "./api.js";
import { applyTheme, formatDate, pluginFullLabel, pluginHref, pluginHue, pluginInitials, plainText, searchHotkeyLabel, t, toggleLang, toggleTheme, ui } from "./ui.js";

const route = useRoute();
const router = useRouter();
const lastCrawledAt = ref("");
const paletteQuery = ref("");
const paletteHits = ref([]);

function current(name) {
  return route.name === name ? "page" : undefined;
}

async function onPaletteInput() {
  const data = await fetchPlugins({ q: paletteQuery.value, size: 8 });
  paletteHits.value = data.content || [];
}

function closePalette() {
  ui.paletteOpen = false;
}

function isSearchHotkey(e) {
  const isK = e.code === "KeyK" || (e.key || "").toLowerCase() === "k";
  return isK && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey;
}

function onKey(e) {
  if (isSearchHotkey(e)) {
    e.preventDefault();
    e.stopPropagation();
    ui.paletteOpen = !ui.paletteOpen;
    return;
  }
  if (e.key === "Escape") closePalette();
}

onMounted(async () => {
  window.addEventListener("keydown", onKey, true);
  applyTheme();
  try {
    const meta = await fetchMeta();
    lastCrawledAt.value = formatDate(meta.lastCrawledAt);
  } catch {
    /* backend may still be starting */
  }
});
onUnmounted(() => window.removeEventListener("keydown", onKey, true));

watch(
  () => ui.paletteOpen,
  async (open) => {
    if (!open) return;
    await nextTick();
    document.querySelector(".palette input")?.focus();
  }
);

function goSearch(q) {
  closePalette();
  router.push({ name: "plugins", query: q ? { q } : {} });
}
</script>

<template>
  <a class="skip" href="#main">{{ t("跳到内容", "Skip to content") }}</a>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/">
        <span class="brand-slot" aria-hidden="true"><img src="/logo.png" alt="" width="36" height="36" /></span>
        <span class="brand-type">
          <strong>Bay</strong>
          <small>DSH 插件仓</small>
        </span>
      </RouterLink>
      <nav class="nav" aria-label="主导航">
        <RouterLink to="/" :aria-current="current('home')">{{ t("首页", "Home") }}</RouterLink>
        <RouterLink to="/plugins/" :aria-current="current('plugins') || current('plugin')">{{ t("插件", "Plugins") }}</RouterLink>
        <RouterLink to="/about/" :aria-current="current('about')">{{ t("关于", "About") }}</RouterLink>
      </nav>
      <div class="header-tools">
        <button class="icon-btn" type="button" :title="t(`搜索（${searchHotkeyLabel()}）`, `Search (${searchHotkeyLabel()})`)" @click="ui.paletteOpen = true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button
          class="icon-btn"
          type="button"
          :aria-pressed="ui.theme === 'dark'"
          :title="t('切换深色模式', 'Toggle dark mode')"
          @click="toggleTheme"
        >
          <svg v-if="ui.theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3.5A8 8 0 1 0 20.5 14 6.2 6.2 0 0 1 15 3.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn lang-btn" type="button" @click="toggleLang">
          {{ ui.lang === "zh" ? "EN" : "中文" }}
        </button>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="移动导航">
    <RouterLink to="/" :aria-current="current('home')">{{ t("首页", "Home") }}</RouterLink>
    <RouterLink to="/plugins/" :aria-current="current('plugins') || current('plugin')">{{ t("插件", "Plugins") }}</RouterLink>
    <RouterLink to="/about/" :aria-current="current('about')">{{ t("关于", "About") }}</RouterLink>
  </nav>

  <RouterView @crawled="(v) => (lastCrawledAt = v)" />

  <footer class="site-footer">
    <div class="footer-inner wrap">
      <div>
        <RouterLink class="brand" to="/">
          <span class="brand-slot" aria-hidden="true"><img src="/logo.png" alt="" width="36" height="36" /></span>
          <span class="brand-type">
            <strong>Bay</strong>
            <small>DSH 插件仓</small>
          </span>
        </RouterLink>
        <p class="disclaimer">{{ t("Bay 是社区项目，并非 DeepSeek 官方产品。", "Bay is a community project, not an official DeepSeek product.") }}</p>
        <p class="crawl" v-if="lastCrawledAt">{{ t("目录更新于", "Catalog updated") }} {{ lastCrawledAt }}</p>
      </div>
      <nav class="footer-links">
        <RouterLink to="/about/">{{ t("关于", "About") }}</RouterLink>
        <a href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">DeepSeek Harness</a>
        <a href="https://toolmanai.com/" target="_blank" rel="noopener">工具人AI · 海外AI使用指南</a>
      </nav>
    </div>
  </footer>

  <div class="overlay" :class="{ 'is-open': ui.paletteOpen }" @click.self="closePalette">
    <div class="palette" role="dialog" aria-modal="true" :aria-label="t('搜索插件', 'Search plugins')">
      <input
        v-model="paletteQuery"
        type="search"
        :placeholder="t('搜索插件、功能或作者', 'Search plugins, capabilities, or authors')"
        @input="onPaletteInput"
        @keydown.enter="goSearch(paletteQuery)"
      />
      <div class="palette-list">
        <RouterLink
          v-for="p in paletteHits"
          :key="p.id"
          class="palette-hit"
          :to="pluginHref(p)"
          @click="closePalette"
        >
          <span class="mark mark-sm" :style="{ '--h': pluginHue(p) }">{{ pluginInitials(p) }}</span>
          <span class="palette-hit-text">
            <strong class="mono">{{ pluginFullLabel(p) }}</strong>
            <small>{{ plainText(p.description) }}</small>
          </span>
        </RouterLink>
        <p v-if="paletteQuery && !paletteHits.length" class="palette-empty">
          {{ t("没有匹配的插件", "No matching plugins") }}
        </p>
      </div>
    </div>
  </div>
  <div class="toast" :class="{ 'is-on': !!ui.toast }">{{ ui.toast }}</div>
</template>
