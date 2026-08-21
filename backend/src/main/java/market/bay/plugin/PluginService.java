package market.bay.plugin;

import market.bay.github.GitHubCrawler;
import market.bay.meta.CrawlMeta;
import market.bay.meta.CrawlMetaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class PluginService {

    private final PluginRepository pluginRepository;
    private final CrawlMetaRepository crawlMetaRepository;
    private final GitHubCrawler gitHubCrawler;

    public PluginService(
            PluginRepository pluginRepository,
            CrawlMetaRepository crawlMetaRepository,
            GitHubCrawler gitHubCrawler
    ) {
        this.pluginRepository = pluginRepository;
        this.crawlMetaRepository = crawlMetaRepository;
        this.gitHubCrawler = gitHubCrawler;
    }

    public Map<String, Object> home() {
        List<PluginView> featured = pluginRepository.findTop6ByFeaturedTrueOrderByStarsDesc()
                .stream().map(p -> PluginView.from(p, false)).toList();
        if (featured.isEmpty()) {
            featured = pluginRepository.findTop6ByPluginLikeTrueOrderByStarsDesc()
                    .stream().map(p -> PluginView.from(p, false)).toList();
        }
        return Map.of(
                "total", pluginRepository.countByPluginLikeTrue(),
                "topicTotal", pluginRepository.count(),
                "lastCrawledAt", lastCrawledAt(),
                "featured", featured,
                "newest", pluginRepository.findTop6ByPluginLikeTrueOrderByPushedAtDesc()
                        .stream().map(p -> PluginView.from(p, false)).toList(),
                "popular", pluginRepository.findTop6ByPluginLikeTrueOrderByStarsDesc()
                        .stream().map(p -> PluginView.from(p, false)).toList()
        );
    }

    public Page<PluginView> search(String q, String capability, String kind, boolean featured, boolean includeAll, String sort, int page, int size) {
        Sort order = switch (sort == null ? "updated" : sort) {
            case "stars" -> Sort.by(Sort.Direction.DESC, "stars");
            case "new" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "pushedAt");
        };
        return pluginRepository.search(
                q == null ? "" : q.trim(),
                capability == null ? "" : capability,
                kind == null ? "" : kind,
                featured,
                includeAll,
                PageRequest.of(page, size, order)
        ).map(p -> PluginView.from(p, false));
    }

    public PluginView detail(String owner, String name) {
        String id = owner + "/" + name;
        Plugin plugin = pluginRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "plugin not found"));
        return PluginView.from(plugin, true);
    }

    public Map<String, Object> meta() {
        return Map.of(
                "total", pluginRepository.countByPluginLikeTrue(),
                "topicTotal", pluginRepository.count(),
                "lastCrawledAt", lastCrawledAt()
        );
    }

    public int crawlNow() {
        return gitHubCrawler.crawl();
    }

    public Map<String, Object> catalogSnapshot() {
        return Map.of(
                "lastCrawledAt", lastCrawledAt(),
                "plugins", pluginRepository.findCatalogItems().stream().map(CatalogItem::toMap).toList()
        );
    }

    private String lastCrawledAt() {
        return crawlMetaRepository.findById("default")
                .map(CrawlMeta::getLastCrawledAt)
                .map(Object::toString)
                .orElse("");
    }
}
