package market.bay.plugin;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public record CatalogItem(
        String id,
        String owner,
        String name,
        String description,
        long stars,
        Instant pushedAt,
        Instant createdAt,
        String htmlUrl,
        String homepage,
        String language,
        String license,
        String topics,
        String capability,
        String kind,
        boolean featured,
        boolean pluginLike,
        String installLine,
        String githubFullName,
        String defaultBranch
) {
    public String installCommand() {
        if (installLine != null && !installLine.isBlank()) {
            return installLine;
        }
        String spec = githubFullName != null && !githubFullName.isBlank() ? githubFullName : id;
        return "dsh plugin --profile web add github:" + spec;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("owner", owner);
        row.put("name", name);
        row.put("description", description);
        row.put("stars", stars);
        row.put("updatedAt", pushedAt != null ? pushedAt.toString() : null);
        row.put("createdAt", createdAt != null ? createdAt.toString() : null);
        row.put("htmlUrl", htmlUrl);
        row.put("homepage", homepage);
        row.put("language", language);
        row.put("license", license);
        row.put("topics", topics);
        row.put("capability", capability);
        row.put("kind", kind);
        row.put("featured", featured);
        row.put("pluginLike", pluginLike);
        row.put("installCommand", installCommand());
        row.put("defaultBranch", defaultBranch);
        return row;
    }
}
