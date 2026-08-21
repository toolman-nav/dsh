<script setup>
import { reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchPlugins } from "../api.js";
import { t } from "../ui.js";
import PluginCard from "../components/PluginCard.vue";

const CAPS = [
  "界面增强",
  "工具与能力",
  "开发运行时",
  "会话与消息",
  "工作流",
  "用量与计费",
  "记忆",
  "通知与集成",
  "主题外观",
  "视觉与多模态",
  "娱乐",
  "Skills",
  "安全与权限",
  "插件市场",
  "模型与供应商",
  "Git / GitHub",
  "浏览器 / Web",
  "远程与移动",
  "语音",
  "文档与渲染",
];
const KINDS = ["工具", "服务", "客户端 UI", "工作流", "主题"];

const route = useRoute();
const router = useRouter();
const listView = ref(false);
const filtersOpen = ref(false);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref("");
const page = reactive({ content: [], totalElements: 0, number: 0, last: true });
const form = reactive({
  q: "",
  capability: "",
  kind: "",
  featured: false,
  includeAll: false,
  sort: "updated",
});

function queryFromForm() {
  const query = {};
  if (form.q) query.q = form.q;
  if (form.capability) query.capability = form.capability;
  if (form.kind) query.kind = form.kind;
  if (form.featured) query.featured = "1";
  if (form.includeAll) query.all = "1";
  if (form.sort && form.sort !== "updated") query.sort = form.sort;
  return query;
}

function syncFromRoute() {
  form.q = typeof route.query.q === "string" ? route.query.q : "";
  form.capability = typeof route.query.capability === "string" ? route.query.capability : "";
  form.kind = typeof route.query.kind === "string" ? route.query.kind : "";
  form.featured = route.query.featured === "1" || route.query.featured === "true";
  form.includeAll = route.query.all === "1" || route.query.all === "true";
  form.sort = typeof route.query.sort === "string" ? route.query.sort : "updated";
}

function applyFilters() {
  filtersOpen.value = false;
  router.replace({ query: queryFromForm() });
}

async function load(reset = true) {
  if (reset) {
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  error.value = "";
  try {
    const nextPage = reset ? 0 : page.number + 1;
    const data = await fetchPlugins({
      q: form.q,
      capability: form.capability,
      kind: form.kind,
      featured: form.featured,
      includeAll: form.includeAll,
      sort: form.sort,
      page: nextPage,
      size: 24,
    });
    if (reset) {
      page.content = data.content || [];
    } else {
      page.content = [...page.content, ...(data.content || [])];
    }
    page.totalElements = data.totalElements ?? 0;
    page.number = data.number ?? nextPage;
    page.last = Boolean(data.last);
  } catch {
    error.value = t("后端还没连上。先启动 Spring Boot。", "Backend is offline. Start Spring Boot first.");
    if (reset) {
      page.content = [];
      page.totalElements = 0;
      page.last = true;
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

watch(
  () => [route.query.q, route.query.capability, route.query.kind, route.query.featured, route.query.all, route.query.sort],
  () => {
    syncFromRoute();
    load(true);
  },
  { immediate: true }
);
</script>

<template>
  <main id="main" class="wrap">
    <header class="page-head">
      <h1>{{ t("探索插件", "Explore plugins") }}</h1>
      <p>{{ t("浏览、筛选，复制安装命令。", "Browse, filter, then copy the install command.") }}</p>
    </header>

    <div class="catalog" :class="{ 'list-view': listView }">
      <div v-if="filtersOpen" class="sheet-backdrop" @click="filtersOpen = false"></div>
      <aside class="filters" :class="{ 'is-open': filtersOpen }">
        <div class="filter-head">
          <h2>{{ t("筛选", "Filters") }}</h2>
          <button class="btn btn-ghost btn-sm sheet-close" type="button" @click="filtersOpen = false">
            {{ t("关闭", "Close") }}
          </button>
        </div>
        <div class="filter-group">
          <h3>{{ t("能力", "Capability") }}</h3>
          <div class="filter-list">
            <label v-for="cap in CAPS" :key="cap">
              <input type="radio" name="cap" :value="cap" v-model="form.capability" @change="applyFilters" />
              {{ cap }}
            </label>
            <label>
              <input type="radio" name="cap" value="" v-model="form.capability" @change="applyFilters" />
              {{ t("全部", "All") }}
            </label>
          </div>
        </div>
        <div class="filter-group">
          <h3>{{ t("类型", "Type") }}</h3>
          <div class="filter-list">
            <label v-for="kind in KINDS" :key="kind">
              <input type="radio" name="kind" :value="kind" v-model="form.kind" @change="applyFilters" />
              {{ kind }}
            </label>
            <label>
              <input type="radio" name="kind" value="" v-model="form.kind" @change="applyFilters" />
              {{ t("全部", "All") }}
            </label>
          </div>
        </div>
      </aside>

      <section class="results-panel">
        <div class="toolbar">
          <form class="search-bar" @submit.prevent="applyFilters">
            <input v-model="form.q" type="search" :placeholder="t('搜索插件、功能或作者', 'Search plugins, capabilities, or authors')" />
          </form>
          <select class="select" v-model="form.sort" @change="applyFilters">
            <option value="updated">{{ t("最近更新", "Recently updated") }}</option>
            <option value="stars">{{ t("最多 Star", "Most stars") }}</option>
            <option value="new">{{ t("最新", "Newest") }}</option>
          </select>
          <label class="chip">
            <input type="checkbox" v-model="form.featured" @change="applyFilters" />
            {{ t("仅看精选", "Featured only") }}
          </label>
          <label class="chip">
            <input type="checkbox" v-model="form.includeAll" @change="applyFilters" />
            {{ t("全部话题仓库", "All topic repos") }}
          </label>
          <button class="btn btn-ghost btn-sm sheet-btn" type="button" @click="filtersOpen = true">
            {{ t("筛选", "Filters") }}
          </button>
          <div class="view-toggle">
            <button type="button" :aria-pressed="!listView" @click="listView = false">▦</button>
            <button type="button" :aria-pressed="listView" @click="listView = true">☰</button>
          </div>
          <span class="toolbar-count">{{ t(`共 ${page.totalElements} 个插件`, `${page.totalElements} plugins`) }}</span>
        </div>
        <div class="active-chips">
          <span v-if="form.featured" class="chip is-on">{{ t("精选", "Featured") }}</span>
          <span v-if="form.includeAll" class="chip is-on">{{ t("全部话题", "All topics") }}</span>
          <span v-if="form.capability" class="chip is-on">{{ form.capability }}</span>
          <span v-if="form.kind" class="chip is-on">{{ form.kind }}</span>
        </div>
        <p v-if="loading" class="status">{{ t("加载中…", "Loading…") }}</p>
        <p v-else-if="error" class="status">{{ error }}</p>
        <div class="grid results">
          <PluginCard v-for="p in page.content" :key="p.id" :plugin="p" />
        </div>
        <button
          v-if="!page.last && page.content.length"
          class="btn btn-ghost load-more"
          type="button"
          :disabled="loadingMore"
          @click="load(false)"
        >
          {{ loadingMore ? t("加载中…", "Loading…") : t("加载更多", "Load more") }}
        </button>
        <div class="empty" :class="{ 'is-visible': !loading && !error && page.content.length === 0 }">
          <h2>{{ t("没有找到插件", "No plugins found") }}</h2>
          <p>{{ t("换一个关键词，或清掉筛选。", "Try another query, or clear filters.") }}</p>
        </div>
      </section>
    </div>
  </main>
</template>
