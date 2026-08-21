import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import PluginsView from "./views/PluginsView.vue";
import PluginDetailView from "./views/PluginDetailView.vue";
import AboutView from "./views/AboutView.vue";
import NotFoundView from "./views/NotFoundView.vue";
import { routeSeo } from "./seo.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Bay · DSH 插件仓｜DeepSeek Harness 社区插件目录",
        description: "发现、搜索和安装 DeepSeek Harness 社区插件，查看 GitHub 仓库、插件能力、安装命令与更新时间。",
        canonicalPath: "/",
      },
    },
    {
      path: "/plugins",
      alias: "/plugins/",
      name: "plugins",
      component: PluginsView,
      meta: {
        title: "DSH 插件目录｜Bay",
        description: "浏览和筛选 DeepSeek Harness 社区插件，按能力、类型、Stars 和更新时间查找可安装插件。",
        canonicalPath: "/plugins/",
      },
    },
    { path: "/plugins/:owner/:name", name: "plugin", component: PluginDetailView, meta: { title: "插件 · Bay" } },
    {
      path: "/about",
      alias: "/about/",
      name: "about",
      component: AboutView,
      meta: {
        title: "关于 Bay DSH 插件仓",
        description: "了解 Bay 的插件来源、收录规则、更新时间和第三方插件安全说明。",
        canonicalPath: "/about/",
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
      meta: {
        title: "页面不存在｜Bay",
        description: "这个地址没有对应的插件或页面。",
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach(routeSeo);

export default router;
