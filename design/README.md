# Bay · DSH 插件仓设计稿

静态高保真原型。不接 API，不爬 GitHub。用浏览器直接打开 HTML 即可。

## 打开方式

用本地静态服务打开（避免 `file://` 下部分浏览器限制）：

```bash
cd design
python3 -m http.server 4173
```

然后访问：

- 首页 http://127.0.0.1:4173/
- 列表 http://127.0.0.1:4173/plugins.html
- 详情 http://127.0.0.1:4173/plugin.html
- 关于 http://127.0.0.1:4173/about.html

提交、文档入口已从导航去掉，不在本轮范围。

## 品牌与 token

| 角色 | 值 |
| --- | --- |
| Paper | `#F7F8FA` |
| Surface | `#FFFFFF` |
| Ink | `#0F1B2D` |
| Harness | `#0B6E99` |
| Display | Bricolage Grotesque |
| Body | Figtree |
| Mono | IBM Plex Mono |

签名元素是卡片左侧的 **插槽边条**，以及可复制的 **安装夹**。格式 / 兼容 / 安全信号本轮先不加。

## 交互（原型范围）

- 顶栏月亮切换浅色 / 暗色，写入 `localStorage`
- `EN` / `中文` 切换主要控件文案
- `⌘K` 打开搜索面板
- 首页搜索跳到列表；列表可筛选假数据，无结果时显示空态
- 卡片和详情的「复制」写入剪贴板
- 窄屏：主导航改成横滑，筛选项从底部 sheet 打开

## 下一步不在本目录

前端技术栈、Java 爬虫、Cloudflare 部署等开发工作等视觉确认后再做。
