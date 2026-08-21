package market.bay.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubContentItem(
        String name,
        String path,
        String type,
        @JsonProperty("download_url") String downloadUrl
) {
}
