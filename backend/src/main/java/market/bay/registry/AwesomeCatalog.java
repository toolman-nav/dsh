package market.bay.registry;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AwesomeCatalog(
        int count,
        String updated,
        List<AwesomePlugin> plugins
) {
}
