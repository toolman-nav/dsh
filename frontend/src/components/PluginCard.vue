<script setup>
import { RouterLink, useRouter } from "vue-router";
import { copyText, formatDate, formatStars, pluginHref, pluginHue, pluginInitials, pluginTitle, plainText, capabilityLabel, kindLabel, t } from "../ui.js";

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
  <article class="card" @click="open">
    <div class="card-body">
      <div class="card-head">
        <span class="mark" :style="{ '--h': pluginHue(plugin) }">{{ pluginInitials(plugin) }}</span>
        <div class="card-head-text">
          <div class="card-top">
            <RouterLink class="card-title" :to="pluginHref(plugin)" @click.stop>{{ pluginTitle(plugin) }}</RouterLink>
            <span class="stars">★ {{ formatStars(plugin.stars) }}</span>
          </div>
          <div class="meta">
            <span>{{ plugin.owner }}</span>
            <span class="meta-dot">{{ t("更新于", "updated") }} {{ formatDate(plugin.updatedAt) }}</span>
          </div>
        </div>
      </div>
      <p>{{ plainText(plugin.description) || t("暂无描述。", "No description.") }}</p>
      <div class="card-tags" v-if="plugin.capability || plugin.kind">
        <span v-if="plugin.capability" class="tag">{{ capabilityLabel(plugin.capability) }}</span>
        <span v-if="plugin.kind" class="tag">{{ kindLabel(plugin.kind) }}</span>
      </div>
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
