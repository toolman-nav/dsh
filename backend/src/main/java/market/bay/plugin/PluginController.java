package market.bay.plugin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PluginController {

    private final PluginService pluginService;
    private final String adminToken;

    public PluginController(PluginService pluginService, @Value("${bay.admin.token:}") String adminToken) {
        this.pluginService = pluginService;
        this.adminToken = adminToken;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> meta = pluginService.meta();
        return Map.of(
                "ok", true,
                "total", meta.get("total"),
                "lastCrawledAt", meta.get("lastCrawledAt")
        );
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        return pluginService.home();
    }

    @GetMapping("/meta")
    public Map<String, Object> meta() {
        return pluginService.meta();
    }

    @GetMapping("/catalog")
    public Map<String, Object> catalog() {
        return pluginService.catalogSnapshot();
    }

    @GetMapping("/plugins")
    public Page<PluginView> plugins(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String capability,
            @RequestParam(defaultValue = "") String kind,
            @RequestParam(defaultValue = "false") boolean featured,
            @RequestParam(defaultValue = "false") boolean includeAll,
            @RequestParam(defaultValue = "updated") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return pluginService.search(
                q, capability, kind, featured, includeAll, sort,
                Math.max(0, page), Math.max(1, Math.min(size, 60))
        );
    }

    @GetMapping("/plugins/{owner}/{name}")
    public PluginView detail(@PathVariable String owner, @PathVariable String name) {
        return pluginService.detail(owner, name);
    }

    @PostMapping("/admin/crawl")
    public Map<String, Object> crawl(
            @RequestHeader(value = "X-Bay-Admin-Token", required = false) String suppliedToken
    ) {
        if (adminToken == null || adminToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "admin crawl is disabled");
        }
        byte[] expected = adminToken.getBytes(StandardCharsets.UTF_8);
        byte[] supplied = String.valueOf(suppliedToken).getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, supplied)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "invalid admin token");
        }
        return Map.of("saved", pluginService.crawlNow());
    }
}
