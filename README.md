# Bay · DSH 插件仓

前后端分离的 DeepSeek Harness 社区插件目录。

- 前端：Vue 3 + Vite，可部署到 Cloudflare Pages
- 当前默认：**静态目录**。构建时把本地已抓取的插件列表打进 `catalog.json`，Pages 不需要 Java 后台
- 后端：Spring Boot 3，定时抓取 GitHub `dsh-plugin` topic。后台上线后，给前端设置 `VITE_API_BASE` 即可切回实时 API
- Java 不能跑在 Cloudflare Workers 上

Bay 不是 DeepSeek 官方产品。列表默认展示仓库名含 `dsh` 的条目；可在插件页打开「全部话题仓库」查看所有带该 topic 的仓库。

## 本地运行

准备：Java 17、Maven、Node.js。可选 `GITHUB_TOKEN`，提高 GitHub API 限额。

```bash
# 终端 1
cd backend
export GITHUB_TOKEN=your_token   # 可选
mvn spring-boot:run

# 终端 2
cd frontend
npm install
npm run dev
```

打开 http://127.0.0.1:5173/

前端开发时把 `/api` 代理到 `http://127.0.0.1:8080`。

## 静态站（先上 Cloudflare Pages）

后台可以后上。先用本地已抓到的数据导出快照，再构建纯静态包：

```bash
# 需本地后端已启动
cd frontend
npm run export-catalog
npm run build
```

产物在 `frontend/dist/`。Pages 设置：

- 项目目录：`frontend`（若用 Git 集成；Direct Upload 则直接上传 `dist`）
- 构建命令：`npm run build`（需仓库里已有 `public/catalog.json`）
- 输出目录：`dist`
- **不要**设置 `VITE_API_BASE`，生产包会读 `/catalog.json`

`public/_redirects` 已把 SPA 路由回退到 `index.html`。详情页 README 会按需从 jsDelivr / GitHub raw 拉，不经过 Java。

本地预览生产包：

```bash
cd frontend
npm run preview
```

数据更新：本地跑完爬虫后再执行 `npm run export-catalog`，重新 build / 上传。

后台上线后，Pages 环境变量设 `VITE_API_BASE=https://your-bay-api.example.com` 并重新构建，即切回实时 API。生产后端可关 H2 控制台：`BAY_H2_CONSOLE=false`。健康检查：`GET /api/health`。

## 抓取

启动时后台抓一次，之后每小时一次。并发抓取会跳过。也可手动：

```bash
curl -X POST http://127.0.0.1:8080/api/admin/crawl
```

未配置 token 时 GitHub 未认证限额较低，默认最多 5 页（约 500 个仓库）。
