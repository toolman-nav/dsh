package market.bay.registry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class AwesomeRegistryClient {

    private final RestClient restClient;
    private final String catalogUrl;

    public AwesomeRegistryClient(@Value("${bay.registry.url}") String catalogUrl) {
        this.catalogUrl = catalogUrl;
        this.restClient = RestClient.builder()
                .defaultHeader("User-Agent", "Bay-DSH-Catalog")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public AwesomeCatalog fetch() {
        return restClient.get()
                .uri(catalogUrl)
                .retrieve()
                .body(AwesomeCatalog.class);
    }
}
