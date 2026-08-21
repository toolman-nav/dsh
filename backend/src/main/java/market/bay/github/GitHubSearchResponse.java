package market.bay.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubSearchResponse(int total_count, List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(
            String name,
            @JsonProperty("full_name") String fullName,
            Owner owner,
            String description,
            @JsonProperty("stargazers_count") long stars,
            @JsonProperty("html_url") String htmlUrl,
            String homepage,
            String language,
            License license,
            List<String> topics,
            @JsonProperty("created_at") Instant createdAt,
            @JsonProperty("updated_at") Instant updatedAt,
            @JsonProperty("pushed_at") Instant pushedAt,
            @JsonProperty("default_branch") String defaultBranch
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Owner(String login) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record License(@JsonProperty("spdx_id") String spdxId) {
    }
}
