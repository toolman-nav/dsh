(() => {
  const plugins = [
    {
      id: "dsh-context",
      href: "plugin.html",
      repo: "bowenliang123/dsh-context",
      desc: "上下文可视化：组成、压缩、剪枝和事件都摊在面板上。",
      descEn: "Context dashboard for composition, compaction, and prune events.",
      author: "bowenliang123",
      stars: 122,
      updated: "2026/8/18",
      cmd: "dsh plugin --profile web add github:bowenliang123/dsh-context#cf28676",
      format: "ok",
      compat: "ok",
      security: "warn",
      cap: "开发",
      type: "工具",
      featured: true,
      noise: false,
    },
    {
      id: "modsearch",
      href: "plugin.html",
      repo: "liustack/modsearch",
      desc: "给没有原生联网能力的模型补上网页与 X 搜索。",
      descEn: "Web and X search bridge for models without native browsing.",
      author: "liustack",
      stars: 114,
      updated: "2026/8/18",
      cmd: "dsh plugin --profile web add github:liustack/modsearch#a91c2e0",
      format: "ok",
      compat: "off",
      security: "ok",
      cap: "搜索",
      type: "工具",
      featured: true,
      noise: false,
    },
    {
      id: "gitbash",
      href: "plugin.html",
      repo: "liceses/dsh-gitbash-preset",
      desc: "把 Windows 极简模式的 bash 映射到 Git Bash。",
      descEn: "Map Windows minimal-mode bash calls onto Git Bash.",
      author: "liceses",
      stars: 124,
      updated: "2026/8/17",
      cmd: "dsh plugin --profile web add github:liceses/dsh-gitbash-preset#b3e11a4",
      format: "ok",
      compat: "ok",
      security: "ok",
      cap: "开发",
      type: "工作流",
      featured: true,
      noise: false,
    },
    {
      id: "skillmanager",
      href: "plugin.html",
      repo: "EricXu20266/dsh-skillmanager",
      desc: "列出、分组、开关 skills，把创建交给宿主 agent。",
      descEn: "List, group, and toggle skills; delegate creation to the host agent.",
      author: "EricXu20266",
      stars: 0,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:EricXu20266/dsh-skillmanager",
      format: "ok",
      compat: "ok",
      security: "warn",
      cap: "效率工具",
      type: "工具",
      featured: false,
      noise: false,
    },
    {
      id: "session-cost",
      href: "plugin.html",
      repo: "dog-lin/dsh-session-cost",
      desc: "把 token 用量折成会话成本，显示在输入框下方。",
      descEn: "Live session cost meter under the composer.",
      author: "dog-lin",
      stars: 0,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:dog-lin/dsh-session-cost",
      format: "ok",
      compat: "warn",
      security: "warn",
      cap: "效率工具",
      type: "工具",
      featured: false,
      noise: false,
    },
    {
      id: "xiaoyao",
      href: "plugin.html",
      repo: "hardcandydemoralisation573/dsh-xiaoyao-skins",
      desc: "可安装、可卸载的社区皮肤合集，不替换核心系统。",
      descEn: "Installable community skins that do not replace the core UI.",
      author: "hardcandydemoralisation573",
      stars: 0,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:hardcandydemoralisation573/dsh-xiaoyao-skins",
      format: "off",
      compat: "off",
      security: "off",
      cap: "UI 主题",
      type: "非插件",
      featured: false,
      noise: true,
    },
    {
      id: "dockyard",
      href: "plugin.html",
      repo: "AITabby/dockyard-dsh",
      desc: "macOS 原生账号池与模型供应商插件。",
      descEn: "macOS-only account pool and provider plugin.",
      author: "AITabby",
      stars: 70,
      updated: "2026/8/18",
      cmd: "dsh plugin --profile web add github:AITabby/dockyard-dsh#9f21c88",
      format: "ok",
      compat: "warn",
      security: "warn",
      cap: "开发",
      type: "服务",
      featured: false,
      noise: false,
    },
    {
      id: "image-describe",
      href: "plugin.html",
      repo: "sd1g1/dsh-image-describe",
      desc: "让纯文本主模型通过 describe_image 看图。",
      descEn: "Give a text-only model an image description tool.",
      author: "sd1g1",
      stars: 1,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:sd1g1/dsh-image-describe",
      format: "ok",
      compat: "ok",
      security: "ok",
      cap: "视觉",
      type: "工具",
      featured: false,
      noise: false,
    },
    {
      id: "material-you",
      href: "plugin.html",
      repo: "mtaech/dsh-material-you",
      desc: "Material You 皮肤：HCT 色板与 Maple Mono。",
      descEn: "Material You skin with HCT palettes and Maple Mono.",
      author: "mtaech",
      stars: 1,
      updated: "2026/8/16",
      cmd: "dsh plugin --profile web add github:mtaech/dsh-material-you",
      format: "ok",
      compat: "warn",
      security: "ok",
      cap: "UI 主题",
      type: "主题",
      featured: false,
      noise: false,
    },
    {
      id: "chrome",
      href: "plugin.html",
      repo: "stuarthu/dsh-chrome",
      desc: "Chrome 侧栏嵌入完整 dsh Web UI，并读取当前页面。",
      descEn: "Chrome side panel that embeds the dsh web UI.",
      author: "stuarthu",
      stars: 0,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:stuarthu/dsh-chrome",
      format: "ok",
      compat: "off",
      security: "ok",
      cap: "浏览器 / Web",
      type: "客户端 UI",
      featured: false,
      noise: false,
    },
    {
      id: "rollback",
      href: "plugin.html",
      repo: "Taler97/dsh-rollback",
      desc: "文件改动回滚，装错可以退回上一个工作区。",
      descEn: "Roll file mutations back to the previous workspace state.",
      author: "Taler97",
      stars: 0,
      updated: "2026/8/19",
      cmd: "dsh plugin --profile web add github:Taler97/dsh-rollback",
      format: "ok",
      compat: "bad",
      security: "warn",
      cap: "开发",
      type: "工具",
      featured: false,
      noise: false,
    },
    {
      id: "open-design",
      href: "plugin.html",
      repo: "nexu-io/open-design",
      desc: "本地优先的设计引擎，让 coding agent 出原型和落地页。",
      descEn: "Local-first design engine for prototypes and landing pages.",
      author: "nexu-io",
      stars: 88000,
      updated: "2026/8/18",
      cmd: "dsh plugin --profile web add github:nexu-io/open-design",
      format: "off",
      compat: "off",
      security: "off",
      cap: "设计",
      type: "非插件",
      featured: false,
      noise: true,
    },
  ];

  const dict = {
    zh: {
      home: "首页",
      plugins: "插件",
      about: "关于",
      search: "搜索插件、功能或作者",
      searchBtn: "搜索",
      cmdk: "按 ⌘K 全局搜索",
      copy: "复制",
      copied: "已复制安装命令",
      themeLight: "浅色",
      themeDark: "暗色",
      lang: "EN",
    },
    en: {
      home: "Home",
      plugins: "Plugins",
      about: "About",
      search: "Search plugins, capabilities, or authors",
      searchBtn: "Search",
      cmdk: "Press ⌘K to search",
      copy: "Copy",
      copied: "Install command copied",
      themeLight: "Light",
      themeDark: "Dark",
      lang: "中文",
    },
  };

  const formatStars = (n) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  const state = {
    theme: localStorage.getItem("bay-theme") || "light",
    lang: localStorage.getItem("bay-lang") || "zh",
    view: "grid",
  };

  const applyTheme = () => {
    document.documentElement.dataset.theme =
      state.theme === "dark" ? "dark" : "light";
    qsa("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(state.theme === "dark"));
      btn.title = state.theme === "dark" ? dict[state.lang].themeLight : dict[state.lang].themeDark;
    });
  };

  const applyLang = () => {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    qsa("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[state.lang][key]) el.textContent = dict[state.lang][key];
    });
    qsa("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[state.lang][key]) el.setAttribute("placeholder", dict[state.lang][key]);
    });
    qsa("[data-desc]").forEach((el) => {
      el.textContent =
        state.lang === "en" && el.dataset.descEn
          ? el.dataset.descEn
          : el.dataset.desc;
    });
  };

  const toast = (msg) => {
    let el = qs(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 1600);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(dict[state.lang].copied);
    } catch {
      toast(text);
    }
  };

  const cardHTML = (p) => `
    <article class="card" data-card data-id="${p.id}" data-repo="${p.repo}" data-author="${p.author}" data-cap="${p.cap}" data-type="${p.type}" data-featured="${p.featured}" data-noise="${p.noise}">
      <div class="slot" aria-hidden="true"></div>
      <div class="card-body">
        <div class="card-top">
          <span class="stars">★ ${formatStars(p.stars)}</span>
          ${p.featured ? `<span class="tag tag-featured">${state.lang === "en" ? "Featured" : "精选"}</span>` : ""}
          ${p.noise ? `<span class="tag tag-noise">${state.lang === "en" ? "Not a plugin" : "非插件"}</span>` : ""}
        </div>
        <a class="repo" href="${p.href}">${p.repo}</a>
        <p data-desc="${p.desc}" data-desc-en="${p.descEn}">${state.lang === "en" ? p.descEn : p.desc}</p>
        <div class="meta">
          <span>${state.lang === "en" ? "by" : "作者"} ${p.author}</span>
          <span>${state.lang === "en" ? "updated" : "更新于"} ${p.updated}</span>
        </div>
        <div class="clip">
          <span class="clip-edge" aria-hidden="true"></span>
          <code>${p.cmd}</code>
          <button type="button" data-copy="${p.cmd}">${dict[state.lang].copy}</button>
        </div>
      </div>
    </article>
  `;

  const moduleHTML = (p) => `
    <a class="module" href="${p.href}">
      <div class="slot" aria-hidden="true"></div>
      <div class="module-body">
        <div class="repo">${p.repo.split("/")[1]}</div>
        <p>${state.lang === "en" ? p.descEn : p.desc}</p>
      </div>
    </a>
  `;

  const mount = (sel, html) => {
    const el = qs(sel);
    if (el) el.innerHTML = html;
  };

  const renderHome = () => {
    const featured = plugins.filter((p) => p.featured);
    const newest = [...plugins].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6);
    const popular = [...plugins].sort((a, b) => b.stars - a.stars).slice(0, 6);
    mount("[data-rail]", featured.map(moduleHTML).join(""));
    mount("[data-grid='featured']", featured.map(cardHTML).join(""));
    mount("[data-grid='new']", newest.map(cardHTML).join(""));
    mount("[data-grid='popular']", popular.map(cardHTML).join(""));
  };

  const currentFilters = () => {
    const caps = qsa("[data-filter-cap]:checked").map((i) => i.value);
    const types = qsa("[data-filter-type]:checked").map((i) => i.value);
    const q = (qs("[data-plugin-search]")?.value || "").trim().toLowerCase();
    const featured = qs("[data-only-featured]")?.checked;
    return { caps, types, q, featured };
  };

  const renderCatalog = () => {
    const root = qs("[data-results]");
    if (!root) return;
    const f = currentFilters();
    const rows = plugins.filter((p) => {
      if (f.q) {
        const blob = `${p.repo} ${p.desc} ${p.descEn} ${p.author} ${p.cap}`.toLowerCase();
        if (!blob.includes(f.q)) return false;
      }
      if (f.featured && !p.featured) return false;
      if (f.caps.length && !f.caps.includes(p.cap)) return false;
      if (f.types.length && !f.types.includes(p.type)) return false;
      return true;
    });
    root.innerHTML = rows.map(cardHTML).join("");
    const count = qs("[data-count]");
    if (count) {
      count.textContent =
        state.lang === "en"
          ? `${rows.length} plugins`
          : `共 ${rows.length} 个插件`;
    }
    const empty = qs("[data-empty]");
    if (empty) {
      const showEmpty = rows.length === 0;
      empty.classList.toggle("is-visible", showEmpty);
      empty.hidden = !showEmpty;
    }
    const chips = qs("[data-active-chips]");
    if (chips) {
      const labels = [];
      if (f.featured) labels.push(state.lang === "en" ? "Featured" : "精选");
      labels.push(...f.caps, ...f.types);
      chips.innerHTML = labels
        .map((l) => `<span class="chip is-on">${l}</span>`)
        .join("");
    }
  };

  const bindCopies = () => {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (btn) copyText(btn.dataset.copy);
    });
  };

  const bindThemeLang = () => {
    qsa("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        localStorage.setItem("bay-theme", state.theme);
        applyTheme();
      });
    });
    qsa("[data-lang-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = state.lang === "zh" ? "en" : "zh";
        localStorage.setItem("bay-lang", state.lang);
        applyLang();
        if (qs("[data-results]")) renderCatalog();
        if (qs("[data-rail]")) renderHome();
      });
    });
  };

  const bindPalette = () => {
    const overlay = qs("[data-overlay]");
    const input = qs("[data-palette-input]");
    const list = qs("[data-palette-list]");
    if (!overlay || !input || !list) return;

    const open = () => {
      overlay.classList.add("is-open");
      input.value = "";
      render("");
      input.focus();
    };
    const close = () => overlay.classList.remove("is-open");
    const render = (q) => {
      const rows = plugins.filter((p) =>
        `${p.repo} ${p.desc} ${p.author}`.toLowerCase().includes(q.toLowerCase())
      );
      list.innerHTML = rows
        .slice(0, 8)
        .map(
          (p) =>
            `<a href="${p.href}"><strong class="mono">${p.repo}</strong><small>${p.desc}</small></a>`
        )
        .join("");
    };

    qsa("[data-open-search]").forEach((el) => el.addEventListener("click", open));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener("input", () => render(input.value));
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        overlay.classList.contains("is-open") ? close() : open();
      }
      if (e.key === "Escape") close();
    });
  };

  const bindCatalog = () => {
    const catalog = qs("[data-catalog]");
    if (!catalog) return;
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const search = qs("[data-plugin-search]");
    if (q && search) search.value = q;

    catalog.addEventListener("change", renderCatalog);
    catalog.addEventListener("input", (e) => {
      if (e.target.matches("[data-plugin-search]")) renderCatalog();
    });
    qsa("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        qsa("[data-view]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn))
        );
        catalog.classList.toggle("list-view", state.view === "list");
      });
    });
    qs("[data-open-filters]")?.addEventListener("click", () => {
      qs(".filters")?.classList.toggle("is-open");
    });
    qs("[data-close-filters]")?.addEventListener("click", () => {
      qs(".filters")?.classList.remove("is-open");
    });
    renderCatalog();
  };

  const bindTabs = () => {
    const tablist = qs("[data-tabs]");
    if (!tablist) return;
    qsa("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        qsa("[data-tab]").forEach((b) =>
          b.setAttribute("aria-selected", String(b === btn))
        );
        qsa("[data-panel]").forEach((p) => {
          p.hidden = p.dataset.panel !== btn.dataset.tab;
        });
      });
    });
  };

  applyTheme();
  applyLang();
  bindThemeLang();
  bindCopies();
  bindPalette();
  bindTabs();
  if (qs("[data-rail]")) renderHome();
  bindCatalog();
})();
