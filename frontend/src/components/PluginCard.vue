<script setup>
import { useRouter } from "vue-router";
import { copyText, formatDate, formatStars, pluginHref, pluginTitle, plainText, t } from "../ui.js";

const props = defineProps({
  plugin: { type: Object, required: true },
});

const router = useRouter();

function open() {
  router.push(pluginHref(props.plugin));
}

async function copyCmd(event) {
  const btn = event.currentTarget;
  await copyText(props.plugin.installCommand);
  btn.classList.add("is-copied");
  window.setTimeout(() => btn.classList.remove("is-copied"), 1600);
}
</script>

<template>
  <article class="card" role="link" tabindex="0" @click="open" @keydown.enter="open">
    <div class="card-body">
      <div class="card-top">
        <span class="card-title">{{ pluginTitle(plugin) }}</span>
        <span class="stars">★ {{ formatStars(plugin.stars) }}</span>
      </div>
      <div class="meta">
        <span>{{ plugin.owner }}</span>
        <span class="meta-dot">{{ t("更新于", "updated") }} {{ formatDate(plugin.updatedAt) }}</span>
      </div>
      <p>{{ plainText(plugin.description) || t("暂无描述。", "No description.") }}</p>
      <div class="cmd">
        <code>{{ plugin.installCommand }}</code>
        <button
          type="button"
          class="copy-icon"
          :aria-label="t('复制', 'Copy')"
          :title="t('复制', 'Copy')"
          @click.stop="copyCmd"
        ></button>
      </div>
    </div>
  </article>
</template>
