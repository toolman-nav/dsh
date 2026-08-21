package market.bay.registry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Component
public class AwesomeRegistryClient {

    private final RestClient restClient;
    private final String catalogUrl;

    public AwesomeRegistryClient(@Value("${bay.registry.url}") String catalogUrl) {
        this.catalogUrl = catalogUrl;
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
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
