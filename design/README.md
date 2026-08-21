# Bay · DSH 插件仓（Pages 发布目录）

线上 https://dshpluginlist.com/ 当前从这个目录发布。内容是 Vue 生产构建（含 `catalog.json`），与本地 `http://127.0.0.1:5173/` 同一套应用。

静态高保真原型已移到 `mock/`，仅作视觉对照，不再对外提供。

更新发布包：

```bash
cd frontend
npm run export-catalog   # 需本地后端
npm run build
rsync -a --delete --exclude mock --exclude README.md dist/ ../design/
```
