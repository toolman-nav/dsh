# Bay · DSH 插件仓（历史原型目录）

此目录只保留历史原型和视觉对照，不再作为 https://dshpluginlist.com/ 的发布源。

静态高保真原型已移到 `mock/`，仅作视觉对照，不再对外提供。

生产发布包由 `frontend` 构建：

```bash
cd frontend
npm run export-catalog   # 需本地后端
npm run build
npm run verify:seo
```
