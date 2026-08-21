package market.bay.plugin;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PluginController {

    private final PluginService pluginService;

    public PluginController(PluginService pluginService) {
        this.pluginService = pluginService;
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
        return pluginService.search(q, capability, kind, featured, includeAll, sort, page, Math.min(size, 60));
    }

    @GetMapping("/plugins/{owner}/{name}")
    public PluginView detail(@PathVariable String owner, @PathVariable String name) {
        return pluginService.detail(owner, name);
    }

    @PostMapping("/admin/crawl")
    public Map<String, Object> crawl() {
        return Map.of("saved", pluginService.crawlNow());
    }
}
