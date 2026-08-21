<script setup>
import { t } from "../ui.js";
</script>

<template>
  <main id="main" class="wrap about-block">
    <h1>{{ t("Bay 不是官方市场", "Bay is not an official marketplace") }}</h1>
    <p class="lede">
      {{ t("Bay 收录社区可安装插件清单，并用 GitHub", "Bay indexes the community installable catalog, and uses GitHub") }}
      <code class="mono">dsh-plugin</code>
      {{ t("话题做增量补漏。默认列表是可安装插件；可在插件页打开「全部话题仓库」查看 topic 噪声仓。Bay 不审核、不担保、不执行第三方代码。", "topic for incremental updates. The default list is installable plugins; turn on “All topic repos” to see the rest. Bay does not audit, warranty, or execute third-party code.") }}
    </p>
    <section>
      <h2>{{ t("数据来源与更新", "Sources and updates") }}</h2>
      <p>{{ t("目录合并社区插件清单与 GitHub dsh-plugin 话题数据，记录仓库描述、Stars、许可证、主要语言、主题和最近更新时间。数据按计划定期重新抓取。", "The catalog combines the community registry with GitHub's dsh-plugin topic, including repository descriptions, stars, licenses, languages, topics, and update dates. It is refreshed on a schedule.") }}</p>
    </section>
    <section>
      <h2>{{ t("如何安装插件", "How to install a plugin") }}</h2>
      <p>{{ t("打开插件详情页，检查源码和权限后复制安装命令，并在自己的 DeepSeek Harness 环境中执行。Bay 只展示命令，不会替你安装或运行第三方代码。", "Open a plugin page, review its source and permissions, copy the install command, and run it in your own DeepSeek Harness environment. Bay displays commands but never installs or runs third-party code for you.") }}</p>
    </section>
    <section>
      <h2>{{ t("安全与收录边界", "Safety and listing scope") }}</h2>
      <p>{{ t("被收录不代表安全认证或官方推荐。安装前应检查维护状态、发布者身份、许可证、网络访问、文件权限和代码执行范围。", "A listing is not a security certification or official endorsement. Before installing, review maintenance status, publisher identity, license, network access, file permissions, and code-execution scope.") }}</p>
    </section>
  </main>
</template>
