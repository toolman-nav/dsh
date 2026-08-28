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

export const KINDS = Object.freeze(["工具", "服务", "客户端 UI", "工作流", "主题"]);

export const CAPABILITY_EN = Object.freeze({
  界面增强: "UI enhancements",
  工具与能力: "Tools & capabilities",
  开发运行时: "Dev runtime",
  会话与消息: "Sessions & messages",
  工作流: "Workflows",
  用量与计费: "Usage & billing",
  记忆: "Memory",
  通知与集成: "Notifications & integrations",
  主题外观: "Themes",
  视觉与多模态: "Vision & multimodal",
  娱乐: "Fun",
  Skills: "Skills",
  安全与权限: "Security & permissions",
  插件市场: "Plugin market",
  模型与供应商: "Models & providers",
  "Git / GitHub": "Git / GitHub",
  "浏览器 / Web": "Browser / Web",
  远程与移动: "Remote & mobile",
  语音: "Voice",
  文档与渲染: "Docs & rendering",
});

export const KIND_EN = Object.freeze({
  工具: "Tool",
  服务: "Service",
  "客户端 UI": "Client UI",
  工作流: "Workflow",
  主题: "Theme",
});

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
