package market.bay.plugin;

import java.util.Locale;
import java.util.Map;

public final class PluginClassifier {

    private static final String HARNESS_CORE = "deepseek-ai/deepseek-harness";

    private static final Map<String, String> REGISTRY_CAPABILITY = Map.ofEntries(
            Map.entry("ui", "界面增强"),
            Map.entry("usage", "用量与计费"),
            Map.entry("theme", "主题外观"),
            Map.entry("model", "模型与供应商"),
            Map.entry("session", "会话与消息"),
            Map.entry("memory", "记忆"),
            Map.entry("tools", "工具与能力"),
            Map.entry("browser", "浏览器 / Web"),
            Map.entry("vision", "视觉与多模态"),
            Map.entry("voice", "语音"),
            Map.entry("docs", "文档与渲染"),
            Map.entry("skill", "Skills"),
            Map.entry("workflow", "工作流"),
            Map.entry("git", "Git / GitHub"),
            Map.entry("notify", "通知与集成"),
            Map.entry("dev", "开发运行时"),
            Map.entry("security", "安全与权限"),
            Map.entry("remote", "远程与移动"),
            Map.entry("market", "插件市场"),
            Map.entry("fun", "娱乐")
    );

    private PluginClassifier() {
    }

    public static boolean harnessCore(String fullName) {
        return fullName != null && fullName.equalsIgnoreCase(HARNESS_CORE);
    }

    public static boolean pluginLike(boolean registryListed, String topics, String name, String description) {
        if (registryListed) {
            return true;
        }
        return pluginLike(topics, name, description);
    }

    public static boolean pluginLike(String topics, String name, String description) {
        String n = name == null ? "" : name.toLowerCase(Locale.ROOT);
        if (n.contains("awesome") || n.equals("deepseek-harness")) {
            return false;
        }
        return n.contains("dsh");
    }

    public static String capabilityFromRegistry(String category) {
        if (category == null || category.isBlank()) {
            return "开发";
        }
        return REGISTRY_CAPABILITY.getOrDefault(category.toLowerCase(Locale.ROOT), "开发");
    }

    public static String kindFromRegistry(String category) {
        if (category == null) {
            return "工具";
        }
        return switch (category.toLowerCase(Locale.ROOT)) {
            case "theme" -> "主题";
            case "workflow" -> "工作流";
            case "remote" -> "客户端 UI";
            case "market" -> "服务";
            default -> "工具";
        };
    }

    public static String capability(String topics, String name, String description) {
        String blob = blob(topics, name, description);
        if (containsAny(blob, "browser", "chrome", "webui", "web-ui", "puppeteer", "playwright")) {
            return "浏览器 / Web";
        }
        if (containsAny(blob, "theme", "skin", "material")) {
            return "UI 主题";
        }
        if (containsAny(blob, "search", "modsearch")) {
            return "搜索";
        }
        if (containsAny(blob, "vision", "image", "ocr", "vlm")) {
            return "视觉";
        }
        if (containsAny(blob, "design", "ui-kit")) {
            return "设计";
        }
        if (containsAny(blob, "github", "gitbash", "git-")) {
            return "Git / GitHub";
        }
        if (containsAny(blob, "mcp")) {
            return "MCP 集成";
        }
        if (containsAny(blob, "cost", "skillmanager", "productivity", "效率")) {
            return "效率工具";
        }
        return "开发";
    }

    public static String kind(String topics, String name, String description) {
        String blob = blob(topics, name, description);
        if (containsAny(blob, "theme", "skin")) {
            return "主题";
        }
        if (containsAny(blob, "workflow", "preset")) {
            return "工作流";
        }
        if (containsAny(blob, "service", "server")) {
            return "服务";
        }
        if (containsAny(blob, "desktop", "electron", "pwa", "mobile")) {
            return "客户端 UI";
        }
        return "工具";
    }

    public static boolean featured(boolean registryListed, String topics, String name, String description, long stars) {
        if (stars < 30 || !pluginLike(registryListed, topics, name, description)) {
            return false;
        }
        String n = name == null ? "" : name.toLowerCase(Locale.ROOT);
        return !containsAny(n, "marketplace", "awesome", "plugin-hub", "plugins-store", "plugin-store");
    }

    private static String blob(String topics, String name, String description) {
        return ((topics == null ? "" : topics) + " " + (name == null ? "" : name) + " "
                + (description == null ? "" : description)).toLowerCase(Locale.ROOT);
    }

    private static boolean containsAny(String blob, String... keys) {
        for (String key : keys) {
            if (blob.contains(key)) {
                return true;
            }
        }
        return false;
    }
}
