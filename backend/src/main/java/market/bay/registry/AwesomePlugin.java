package market.bay.registry;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AwesomePlugin(
        String name,
        String owner,
        String url,
        String category,
        AwesomeDescription description,
        Long stars,
        String install,
        String added,
        String npm
) {
    public String textDescription() {
        if (description == null) {
            return null;
        }
        if (description.zh() != null && !description.zh().isBlank()) {
            return description.zh().trim();
        }
        if (description.en() != null && !description.en().isBlank()) {
            return description.en().trim();
        }
        return null;
    }
}
