package market.bay.plugin;

import java.util.Map;

public record PluginView(
        String id,
        String owner,
        String name,
        String description,
        long stars,
        String updatedAt,
        String createdAt,
        String htmlUrl,
        String homepage,
        String language,
        String license,
        String topics,
        String capability,
        String kind,
        boolean featured,
        boolean pluginLike,
        String installCommand,
        String defaultBranch,
        String readmeMarkdown,
        Map<String, String> readmeLocales
) {
    public static PluginView from(Plugin plugin, boolean includeReadme) {
        return new PluginView(
                plugin.getId(),
                plugin.getOwner(),
                plugin.getName(),
                plugin.getDescription(),
                plugin.getStars(),
                plugin.getPushedAt() != null ? plugin.getPushedAt().toString() : null,
                plugin.getCreatedAt() != null ? plugin.getCreatedAt().toString() : null,
                plugin.getHtmlUrl(),
                plugin.getHomepage(),
                plugin.getLanguage(),
                plugin.getLicense(),
                plugin.getTopics(),
                plugin.getCapability(),
                plugin.getKind(),
                plugin.isFeatured(),
                plugin.isPluginLike(),
                plugin.installCommand(),
                plugin.getDefaultBranch(),
                includeReadme ? plugin.getReadmeMarkdown() : null,
                includeReadme ? ReadmeLocales.parse(plugin.getReadmeLocalesJson()) : Map.of()
        );
    }
}
