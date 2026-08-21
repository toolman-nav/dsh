# Bay · DSH 插件仓

前后端分离的 DeepSeek Harness 社区插件目录。

- 前端：Vue 3 + Vite，部署到 Cloudflare Workers Static Assets
- 当前默认：静态目录。构建时把已抓取的插件列表打进静态页面与 JSON，线上不需要 Java 后台
- 后端：Spring Boot 3，定时抓取 GitHub `dsh-plugin` topic；后台上线后可用 `VITE_API_BASE` 切回实时 API
- Java 不能运行在 Cloudflare Workers 上

Bay 不是 DeepSeek 官方产品。列表默认展示仓库名含 `dsh` 的条目；可在插件页打开「全部话题仓库」查看所有带该 topic 的仓库。

## 本地运行

准备：Java 17、Maven、Node.js。可选 `GITHUB_TOKEN`，提高 GitHub API 限额。需要手动触发抓取时请设置高强度随机值 `BAY_ADMIN_TOKEN`。

```bash
# 终端 1
cd backend
export GITHUB_TOKEN=your_token   # 可选
export BAY_ADMIN_TOKEN=replace-with-a-long-random-secret
mvn spring-boot:run

# 终端 2
cd frontend
npm install
npm run dev
```

打开 http://127.0.0.1:5173/ 。前端开发时会把 `/api` 代理到 `http://127.0.0.1:8080`。

## 静态站（GitHub → Cloudflare Worker `dsh`）

仓库接入的是 Workers Builds。`design/` 仅保留早期原型，不再作为生产发布目录；构建在 `frontend` 中生成 `dist`，仓库根目录的 `wrangler.toml` 再发布 `frontend/dist`。

```bash
# 有新目录数据时（需本地后端）
cd frontend
npm run export-catalog
npm run build
npm run verify:seo
```

Cloudflare Workers Builds 设置：

- Root directory：`frontend`
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- 不设置 `VITE_API_BASE` 时，生产包读取构建生成的 `/data/catalog-index.json` 与详情分片

构建会为首页、目录、关于页和每个插件详情生成独立 HTML，并生成 `sitemap.xml`、`robots.txt`、`llms.txt`、`llms-full.txt` 与分片 JSON 数据。Wrangler 使用 `404-page` 提供真实 404；不要重新加入 `/* /index.html 200`，否则未知 URL 会成为不利于 SEO 的软 404，并可能被 Cloudflare 判定为无限循环。

本地预览生产包：

```bash
cd frontend
npm run preview
```

后台上线后，在 Workers Builds 设置 `VITE_API_BASE=https://your-bay-api.example.com` 并重新构建，即可切回实时 API。构建脚本会同时从该地址的 `/api/catalog` 获取快照，用于生成插件详情 HTML、结构化数据、站点地图和 GEO 文本，确保首屏 SEO 内容与实时数据源一致；数据更新后应触发一次重新部署。若 SEO 构建需要使用不同数据源，可用 `SEO_CATALOG_API_BASE` 覆盖该地址。H2 控制台默认关闭；仅在可信本地环境按需设置 `BAY_H2_CONSOLE=true`。健康检查：`GET /api/health`。

## 抓取

启动时后台抓一次，之后每小时一次。并发抓取会跳过。也可手动：

```bash
curl -X POST -H "X-Bay-Admin-Token: $BAY_ADMIN_TOKEN" http://127.0.0.1:8080/api/admin/crawl
```

未配置 `GITHUB_TOKEN` 时 GitHub 未认证限额较低，默认最多 5 页（约 500 个仓库）。未配置 `BAY_ADMIN_TOKEN` 时手动抓取接口保持禁用。生产环境还应设置 `BAY_DB_PASSWORD`，如需多个前端域名可用逗号分隔的 `BAY_ALLOWED_ORIGINS` 配置。连续 7 天未在社区 registry 中出现的旧条目会被清理，可通过 `BAY_STALE_DAYS` 调整宽限期。
