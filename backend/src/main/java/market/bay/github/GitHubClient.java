package market.bay.github;

import market.bay.plugin.ReadmeNames;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class GitHubClient {

    private static final MediaType GITHUB_RAW = MediaType.parseMediaType("application/vnd.github.raw+json");

    private final RestClient restClient;

    public GitHubClient(@Value("${bay.github.token:}") String token) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(8));
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.github.com")
                .requestFactory(factory)
                .defaultHeader("User-Agent", "Bay-DSH-Catalog")
                .defaultHeader("Accept", "application/vnd.github+json");
        if (token != null && !token.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + token);
        }
        this.restClient = builder.build();
    }

    public GitHubSearchResponse searchTopic(String topic, int page, int perPage) {
        return restClient.get()
                .uri(uri -> uri.path("/search/repositories")
                        .queryParam("q", "topic:" + topic)
                        .queryParam("sort", "updated")
                        .queryParam("order", "desc")
                        .queryParam("per_page", perPage)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(GitHubSearchResponse.class);
    }

    public String fetchReadme(String owner, String repo) {
        Map<String, String> locales = fetchReadmeLocales(owner, repo);
        if (locales.containsKey("default")) {
            return locales.get("default");
        }
        return locales.values().stream().filter(value -> value != null && !value.isBlank()).findFirst().orElse(null);
    }

    public Map<String, String> fetchReadmeLocales(String owner, String repo) {
        Map<String, String> locales = new LinkedHashMap<>();
        List<GitHubContentItem> files = new ArrayList<>();
        GitHubContentItem docs = null;
        for (GitHubContentItem item : listContents(owner, repo, "")) {
            if ("dir".equals(item.type()) && "docs".equalsIgnoreCase(item.name())) {
                docs = item;
            } else if (isReadmeFile(item)) {
                files.add(item);
            }
        }
        if (docs != null) {
            for (GitHubContentItem item : listContents(owner, repo, docs.path())) {
                if (isReadmeFile(item)) {
                    files.add(item);
                }
            }
        }
        if (files.isEmpty()) {
            String fallback = fetchDefaultReadme(owner, repo);
            if (fallback != null && !fallback.isBlank()) {
                locales.put("default", fallback);
            }
            return locales;
        }
        for (GitHubContentItem file : files) {
            String body = fetchRawFile(owner, repo, file.path());
            if (body == null || body.isBlank()) {
                continue;
            }
            String locale = ReadmeNames.localeOf(file.name());
            locales.merge(locale, body, (left, right) -> right.length() > left.length() ? right : left);
        }
        return locales;
    }

    private List<GitHubContentItem> listContents(String owner, String repo, String path) {
        try {
            GitHubContentItem[] items = restClient.get()
                    .uri(uri -> {
                        if (path == null || path.isBlank()) {
                            return uri.path("/repos/{owner}/{repo}/contents").build(owner, repo);
                        }
                        return uri.path("/repos/{owner}/{repo}/contents/{path}").build(owner, repo, path);
                    })
                    .retrieve()
                    .body(GitHubContentItem[].class);
            return items == null ? List.of() : List.of(items);
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String fetchRawFile(String owner, String repo, String path) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/repos/{owner}/{repo}/contents/{path}").build(owner, repo, path))
                    .accept(GITHUB_RAW)
                    .retrieve()
                    .body(String.class);
        } catch (Exception ex) {
            return null;
        }
    }

    private String fetchDefaultReadme(String owner, String repo) {
        try {
            return restClient.get()
                    .uri("/repos/{owner}/{repo}/readme", owner, repo)
                    .accept(GITHUB_RAW)
                    .retrieve()
                    .body(String.class);
        } catch (Exception ex) {
            return null;
        }
    }

    private static boolean isReadmeFile(GitHubContentItem item) {
        return item != null && "file".equals(item.type()) && ReadmeNames.isReadmeFile(item.name());
    }
}
