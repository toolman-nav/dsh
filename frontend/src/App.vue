<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { fetchMeta, fetchPlugins } from "./api.js";
import { applyTheme, formatDate, pluginFullLabel, pluginHref, plainText, t, toggleLang, toggleTheme, ui } from "./ui.js";

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

function onKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    ui.paletteOpen = !ui.paletteOpen;
  }
  if (e.key === "Escape") closePalette();
}

onMounted(async () => {
  document.addEventListener("keydown", onKey);
  applyTheme();
  try {
    const meta = await fetchMeta();
    lastCrawledAt.value = formatDate(meta.lastCrawledAt);
  } catch {
    /* backend may still be starting */
  }
});
onUnmounted(() => document.removeEventListener("keydown", onKey));

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
        <button class="icon-btn" type="button" :title="t('搜索', 'Search')" @click="ui.paletteOpen = true">
          ⌕
        </button>
        <button
          class="icon-btn"
          type="button"
          :aria-pressed="ui.theme === 'dark'"
          :title="t('切换深色模式', 'Toggle dark mode')"
          @click="toggleTheme"
        >
          ◐
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
          :to="pluginHref(p)"
          @click="closePalette"
        >
          <strong class="mono">{{ pluginFullLabel(p) }}</strong>
          <small>{{ plainText(p.description) }}</small>
        </RouterLink>
        <p v-if="paletteQuery && !paletteHits.length" class="palette-empty">
          {{ t("没有匹配的插件", "No matching plugins") }}
        </p>
      </div>
    </div>
  </div>
  <div class="toast" :class="{ 'is-on': !!ui.toast }">{{ ui.toast }}</div>
</template>
