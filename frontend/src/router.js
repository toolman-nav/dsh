import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import PluginsView from "./views/PluginsView.vue";
import PluginDetailView from "./views/PluginDetailView.vue";
import AboutView from "./views/AboutView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { title: "Bay · DSH 插件仓" } },
    { path: "/plugins", name: "plugins", component: PluginsView, meta: { title: "插件 · Bay" } },
    { path: "/plugins/:owner/:name", name: "plugin", component: PluginDetailView, meta: { title: "插件 · Bay" } },
    { path: "/about", name: "about", component: AboutView, meta: { title: "关于 · Bay" } },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (to.name !== "plugin") {
    document.title = to.meta.title || "Bay · DSH 插件仓";
  }
});

export default router;
