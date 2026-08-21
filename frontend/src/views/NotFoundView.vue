<script setup>
import { RouterLink } from "vue-router";
import { t } from "../ui.js";
</script>

<template>
  <main id="main" class="wrap about-block">
    <p class="kicker">404</p>
    <h1>{{ t("页面不存在", "Page not found") }}</h1>
    <p class="lede">{{ t("这个地址没有对应的插件或页面。", "There is no plugin or page at this address.") }}</p>
    <p><RouterLink class="btn" to="/plugins/">{{ t("返回插件目录", "Back to plugin catalog") }}</RouterLink></p>
  </main>
</template>
