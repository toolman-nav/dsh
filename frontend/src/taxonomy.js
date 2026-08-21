export const CAPABILITIES = Object.freeze([
  "界面增强",
  "工具与能力",
  "开发运行时",
  "会话与消息",
  "工作流",
  "用量与计费",
  "记忆",
  "通知与集成",
  "主题外观",
  "视觉与多模态",
  "娱乐",
  "Skills",
  "安全与权限",
  "插件市场",
  "模型与供应商",
  "Git / GitHub",
  "浏览器 / Web",
  "远程与移动",
  "语音",
  "文档与渲染",
]);

const LEGACY_CAPABILITIES = Object.freeze({
  "开发": "开发运行时",
  "搜索": "工具与能力",
  "MCP 集成": "工具与能力",
  "效率工具": "工具与能力",
  "视觉": "视觉与多模态",
  "UI 主题": "主题外观",
  "设计": "界面增强",
});

export function normalizeCapability(value) {
  const capability = String(value || "").trim();
  if (CAPABILITIES.includes(capability)) return capability;
  return LEGACY_CAPABILITIES[capability] || "开发运行时";
}

export function normalizePlugin(plugin) {
  return plugin ? { ...plugin, capability: normalizeCapability(plugin.capability) } : plugin;
}
