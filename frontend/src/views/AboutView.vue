<script setup>
import { t } from "../ui.js";
</script>

<template>
  <main id="main" class="wrap about-block">
    <h1>{{ t("Bay 不是官方市场", "Bay is not an official marketplace") }}</h1>
    <p class="lede">
      {{ t("Bay 收录社区可安装插件清单，并用 GitHub", "Bay indexes the community installable catalog, and uses GitHub") }}
      <code class="mono">dsh-plugin</code>
      {{ t("话题做增量补漏。默认列表是可安装插件；可在插件页打开「全部话题仓库」查看 topic 噪声仓。Bay 不审核、不担保、不执行第三方代码。", "topic for incremental updates. The default list is installable plugins; turn on “All topic repos” to see the rest. Bay does not audit, warranty, or execute third-party code.") }}
    </p>
  </main>
</template>
