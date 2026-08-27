<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchHome } from "../api.js";
import { HOME_HEADING, setHomeSeo } from "../seo.js";
import { formatDate, formatStars, pluginHref, pluginHue, pluginInitials, pluginTitle, plainText, searchHotkeyLabel, t } from "../ui.js";
import PluginCard from "../components/PluginCard.vue";

const route = useRoute();
const router = useRouter();
const emit = defineEmits(["crawled"]);
const q = ref("");
const home = ref({ featured: [], newest: [], popular: [], total: 0, lastCrawledAt: "" });
const loading = ref(true);
const error = ref("");
const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const featuredLoop = computed(() => {
  const items = home.value.featured;
  if (!items.length) {
    return [];
  }
  return reduceMotion ? items : [...items, ...items];
});
const railDuration = computed(() => {
  const n = home.value.featured.length;
  if (!n) {
    return "40s";
  }
  return `${Math.max(28, Math.round((n * 292) / 22))}s`;
});

onMounted(async () => {
  try {
    home.value = await fetchHome();
    if (route.name === "home") {
      setHomeSeo(home.value.total, {
        robots: Object.keys(route.query || {}).length > 0 ? "noindex,follow" : undefined,
      });
    }
    emit("crawled", formatDate(home.value.lastCrawledAt));
  } catch {
    error.value = t("首页数据加载失败，请刷新后重试。", "Home data failed to load. Refresh and try again.");
  } finally {
    loading.value = false;
  }
});

function search() {
  router.push({ name: "plugins", query: q.value ? { q: q.value } : {} });
}
</script>

<template>
  <main id="main" class="wrap home">
    <section class="hero">
      <p class="kicker">{{ t("社区目录 · 非官方", "Community catalog · unofficial") }}</p>
      <h1>{{ t(HOME_HEADING, "DeepSeek Harness plugin catalog") }}</h1>
      <p class="lede">
        {{ t("把插件插进 Harness。Bay从各个地方的", "Plug into Harness. Bay collects plugins from") }}
        <code class="mono">dsh-plugin</code>
        {{ t("话题收插件。搜到之后，复制安装命令即可。", " topics in various places. Search, then copy the install command.") }}
      </p>
      <form class="search-bar search-bar-lg" @submit.prevent="search">
        <input
          v-model="q"
          type="search"
          :placeholder="t('搜索插件、功能或作者', 'Search plugins, capabilities, or authors')"
        />
        <button class="btn" type="submit">{{ t("搜索", "Search") }}</button>
      </form>
      <div class="hero-meta">
        <p class="hint">{{ t(`按 ${searchHotkeyLabel()} 全局搜索`, `Press ${searchHotkeyLabel()} to search`) }}</p>
        <p class="hint hero-count" v-if="home.total">
          {{ t(`已收录 ${home.total} 个插件`, `${home.total} plugins indexed`) }}
        </p>
      </div>
      <div class="chips">
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '开发运行时' } }">{{ t("开发运行时", "Dev runtime") }}</RouterLink>
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '浏览器 / Web' } }">{{ t("浏览器 / Web", "Browser / Web") }}</RouterLink>
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '工具与能力' } }">{{ t("工具与能力", "Tools") }}</RouterLink>
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '主题外观' } }">{{ t("主题外观", "Themes") }}</RouterLink>
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '视觉与多模态' } }">{{ t("视觉与多模态", "Vision") }}</RouterLink>
        <RouterLink class="chip" :to="{ name: 'plugins', query: { capability: '界面增强' } }">{{ t("界面增强", "UI enhancements") }}</RouterLink>
        <RouterLink class="chip chip-more" to="/plugins/">{{ t("全部插件", "All plugins") }}</RouterLink>
      </div>
    </section>

    <p v-if="loading" class="status">{{ t("加载中…", "Loading…") }}</p>
    <p v-if="error" class="lede">{{ error }}</p>

    <section class="section" v-if="home.featured.length">
      <div class="section-head">
        <h2>{{ t("精选模块", "Featured modules") }}</h2>
        <RouterLink :to="{ name: 'plugins', query: { featured: '1' } }">{{ t("查看全部", "View all") }}</RouterLink>
      </div>
      <div class="rail" :class="{ 'is-auto': !reduceMotion }" :style="{ '--rail-duration': railDuration }" aria-label="精选插件">
        <div class="rail-track">
          <RouterLink v-for="(p, i) in featuredLoop" :key="`${p.id}-${i}`" class="module" :to="pluginHref(p)">
            <span class="mark mark-sm" :style="{ '--h': pluginHue(p) }">{{ pluginInitials(p) }}</span>
            <div class="module-copy">
              <div class="module-title">{{ pluginTitle(p) }}</div>
              <p>{{ plainText(p.description) }}</p>
            </div>
            <div class="module-meta">★ {{ formatStars(p.stars) }}</div>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section" v-if="home.featured.length">
      <div class="section-head">
        <h2>{{ t("精选", "Featured") }}</h2>
        <RouterLink :to="{ name: 'plugins', query: { featured: '1' } }">{{ t("查看全部", "View all") }}</RouterLink>
      </div>
      <div class="grid">
        <PluginCard v-for="p in home.featured" :key="p.id" :plugin="p" />
      </div>
    </section>

    <section class="section" v-if="home.newest.length">
      <div class="section-head">
        <h2>{{ t("最新上架", "New") }}</h2>
        <RouterLink :to="{ name: 'plugins', query: { sort: 'new' } }">{{ t("查看全部", "View all") }}</RouterLink>
      </div>
      <div class="grid">
        <PluginCard v-for="p in home.newest" :key="p.id" :plugin="p" />
      </div>
    </section>

    <section class="section" v-if="home.popular.length">
      <div class="section-head">
        <h2>{{ t("热门", "Popular") }}</h2>
        <RouterLink :to="{ name: 'plugins', query: { sort: 'stars' } }">{{ t("查看全部", "View all") }}</RouterLink>
      </div>
      <div class="grid">
        <PluginCard v-for="p in home.popular" :key="p.id" :plugin="p" />
      </div>
    </section>
  </main>
</template>
