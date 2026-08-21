<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { fetchPlugin, hydrateReadme } from "../api.js";
import { renderReadme } from "../readme.js";
import { pluginJsonLd, setSeo } from "../seo.js";
import { copyText, formatDate, formatStars, pickReadme, pluginFullLabel, plainText, t, ui } from "../ui.js";

const route = useRoute();
const plugin = ref(null);
const tab = ref("readme");
const error = ref("");

const readmeHtml = computed(() => {
  void ui.lang;
  return renderReadme(pickReadme(plugin.value, ui.lang !== "en"), plugin.value || {});
});

async function onReadmeClick(event) {
  const btn = event.target.closest(".readme-copy");
  if (!btn) {
    return;
  }
  const text = btn.closest(".readme-code")?.querySelector("pre")?.textContent ?? "";
  if (!text) {
    return;
  }
  const copied = t("已复制", "Copied");
  await copyText(text, copied);
  btn.classList.add("is-copied");
  btn.setAttribute("aria-label", copied);
  btn.setAttribute("title", copied);
  window.setTimeout(() => {
    const label = t("复制", "Copy");
    btn.classList.remove("is-copied");
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  }, 1600);
}

async function load() {
  error.value = "";
  tab.value = "readme";
  setSeo({
    title: t("插件加载中｜Bay", "Loading plugin | Bay"),
    description: t("正在加载 DSH 插件信息。", "Loading DSH plugin information."),
    path: route.path,
    robots: "noindex,follow",
  });
  try {
    plugin.value = await fetchPlugin(route.params.owner, route.params.name);
    hydrateReadme(plugin.value, ui.lang !== "en").then((next) => {
      if (plugin.value?.id === next?.id) {
        plugin.value = next;
      }
    });
  } catch {
    plugin.value = null;
    error.value = t("没有找到这个插件。", "Plugin not found.");
  }
}

watch(() => [route.params.owner, route.params.name], load, { immediate: true });
watch(
  () => [plugin.value, ui.lang],
  (p) => {
    const item = p[0];
    if (!item?.id) return;
    const description = plainText(item.description) || t(
      `${pluginFullLabel(item)} 是一个 DeepSeek Harness 社区插件，查看安装命令、源码与更新时间。`,
      `${pluginFullLabel(item)} is a community plugin for DeepSeek Harness. View its install command, source, and update date.`
    );
    const path = `/plugins/${encodeURIComponent(item.owner)}/${encodeURIComponent(item.id.slice(item.id.indexOf("/") + 1))}/`;
    setSeo({
      title: `${pluginFullLabel(item)}｜DSH 插件｜Bay`,
      description: description.slice(0, 160),
      path,
      robots: item.pluginLike ? undefined : "noindex,follow",
      type: "article",
      jsonLd: pluginJsonLd(item, path, description),
    });
  }
);

async function copyInstall(event) {
  const btn = event.currentTarget;
  await copyText(plugin.value.installCommand);
  btn.classList.add("is-copied");
  window.setTimeout(() => btn.classList.remove("is-copied"), 1600);
}
</script>

<template>
  <main id="main" class="wrap detail" v-if="plugin">
    <article>
      <p class="crumb">
        <RouterLink to="/plugins">{{ t("插件", "Plugins") }}</RouterLink>
        /
        <a :href="`https://github.com/${encodeURIComponent(plugin.owner)}`" target="_blank" rel="noreferrer">{{ plugin.owner }}</a>
        /
        <a :href="plugin.htmlUrl" target="_blank" rel="noreferrer">{{ plugin.name }}</a>
      </p>
      <h1>{{ pluginFullLabel(plugin) }}</h1>
      <p class="lede">{{ plainText(plugin.description) }}</p>

      <div class="tabs" role="tablist">
        <button type="button" :aria-selected="tab === 'readme'" @click="tab = 'readme'">README</button>
        <button type="button" :aria-selected="tab === 'overview'" @click="tab = 'overview'">{{ t("概览", "Overview") }}</button>
      </div>

      <section
        v-show="tab === 'readme'"
        class="readme"
        v-html="readmeHtml || `<p>${t('暂无 README。', 'No README.')}</p>`"
        @click="onReadmeClick"
      ></section>
      <section v-show="tab === 'overview'" class="readme">
        <h2>{{ t("概览", "Overview") }}</h2>
        <p>{{ t("类型", "Type") }}：{{ plugin.kind }} · {{ t("能力", "Capability") }}：{{ plugin.capability }} · Star {{ formatStars(plugin.stars) }}</p>
        <p>{{ t("语言", "Language") }}：{{ plugin.language || "—" }} · {{ t("协议", "License") }}：{{ plugin.license || "—" }}</p>
      </section>
    </article>

    <aside class="install-panel">
      <h2>{{ t("安装", "Install") }}</h2>
      <p class="note">{{ t("从 GitHub 安装到当前 DSH profile。", "Install from GitHub into the current DSH profile.") }}</p>
      <div class="cmd">
        <code>{{ plugin.installCommand }}</code>
        <button
          type="button"
          class="copy-icon"
          :aria-label="t('复制', 'Copy')"
          :title="t('复制', 'Copy')"
          @click="copyInstall"
        ></button>
      </div>
      <div class="panel-actions">
        <a class="btn btn-sm" :href="plugin.htmlUrl" target="_blank" rel="noreferrer">{{ t("查看源码", "View source") }}</a>
        <RouterLink class="btn btn-ghost btn-sm" to="/plugins">{{ t("返回目录", "Back to catalog") }}</RouterLink>
      </div>
      <dl class="facts">
        <div>
          <dt>{{ t("协议", "License") }}</dt>
          <dd>{{ plugin.license || "—" }}</dd>
        </div>
        <div>
          <dt>Stars</dt>
          <dd>{{ plugin.stars }}</dd>
        </div>
        <div>
          <dt>{{ t("更新", "Updated") }}</dt>
          <dd>{{ formatDate(plugin.updatedAt) }}</dd>
        </div>
      </dl>
    </aside>
  </main>
  <main id="main" class="wrap" v-else>
    <p class="lede">{{ error || t("加载中…", "Loading…") }}</p>
  </main>
</template>
