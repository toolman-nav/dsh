import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import { applyTheme } from "./ui.js";
import "./styles.css";

applyTheme();
createApp(App).use(router).mount("#app");
