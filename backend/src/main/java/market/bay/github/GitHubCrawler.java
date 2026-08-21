package market.bay.github;

import market.bay.meta.CrawlMeta;
import market.bay.meta.CrawlMetaRepository;
import market.bay.plugin.Plugin;
import market.bay.plugin.PluginClassifier;
import market.bay.plugin.PluginIds;
import market.bay.plugin.PluginRepository;
import market.bay.plugin.ReadmeLocales;
import market.bay.registry.AwesomeCatalog;
import market.bay.registry.AwesomePlugin;
import market.bay.registry.AwesomeRegistryClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class GitHubCrawler {

    private static final Logger log = LoggerFactory.getLogger(GitHubCrawler.class);

    private final GitHubClient gitHubClient;
    private final AwesomeRegistryClient awesomeRegistryClient;
    private final PluginRepository pluginRepository;
    private final CrawlMetaRepository crawlMetaRepository;
    private final String topic;
    private final int maxPages;
    private final int readmeLimit;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public GitHubCrawler(
            GitHubClient gitHubClient,
            AwesomeRegistryClient awesomeRegistryClient,
            PluginRepository pluginRepository,
            CrawlMetaRepository crawlMetaRepository,
            @Value("${bay.github.topic}") String topic,
            @Value("${bay.github.max-pages}") int maxPages,
            @Value("${bay.crawl.readme-limit:60}") int readmeLimit
    ) {
        this.gitHubClient = gitHubClient;
        this.awesomeRegistryClient = awesomeRegistryClient;
        this.pluginRepository = pluginRepository;
        this.crawlMetaRepository = crawlMetaRepository;
        this.topic = topic;
        this.maxPages = maxPages;
        this.readmeLimit = Math.max(0, readmeLimit);
    }

    @Scheduled(cron = "${bay.crawl.cron}")
    public void crawlOnSchedule() {
        crawl();
    }

    public int crawl() {
        if (!running.compareAndSet(false, true)) {
            log.info("Skip crawl because another crawl is running");
            return 0;
        }
        Instant now = Instant.now();
        int saved = 0;
        String error = null;
        try {
            try {
                saved += ingestRegistry(now);
                try {
                    saved += ingestGitHubTopic(now);
                } catch (Exception ex) {
                    log.warn("GitHub topic crawl failed after registry ingest: {}", ex.getMessage());
                }
                pluginRepository.findById("deepseek-ai/deepseek-harness").ifPresent(pluginRepository::delete);
                dropGithubDuplicates();
                reclassifyAll();
                ingestReadmes(now);
                log.info("Crawled {} plugin rows (registry + GitHub topic {})", saved, topic);
            } catch (Exception ex) {
                error = ex.getMessage();
                log.warn("Catalog crawl failed: {}", error);
            }
            CrawlMeta meta = crawlMetaRepository.findById("default").orElseGet(CrawlMeta::new);
            meta.setId("default");
            if (error == null) {
                meta.setLastCrawledAt(now);
                meta.setLastCount(saved);
                meta.setLastError(null);
            } else {
                meta.setLastError(error);
            }
            crawlMetaRepository.save(meta);
            return saved;
        } finally {
            running.set(false);
        }
    }

    public void reclassifyAll() {
        for (Plugin plugin : pluginRepository.findAll()) {
            if (PluginClassifier.harnessCore(plugin.getId()) || PluginClassifier.harnessCore(plugin.getGithubFullName())) {
                pluginRepository.delete(plugin);
                continue;
            }
            applyClassification(plugin);
            pluginRepository.save(plugin);
        }
    }

    private int ingestRegistry(Instant now) {
        AwesomeCatalog catalog = awesomeRegistryClient.fetch();
        if (catalog == null || catalog.plugins() == null || catalog.plugins().isEmpty()) {
            log.warn("Awesome registry returned no plugins");
            return 0;
        }
        int saved = 0;
        for (AwesomePlugin entry : catalog.plugins()) {
            if (entry == null || entry.owner() == null || entry.name() == null) {
                continue;
            }
            String githubFullName = GithubRefs.fullName(entry.url());
            if (PluginClassifier.harnessCore(githubFullName)) {
                continue;
            }
            String id = PluginIds.of(entry.owner(), entry.name());
            Plugin plugin = pluginRepository.findById(id).orElseGet(Plugin::new);
            plugin.setId(id);
            plugin.setOwner(entry.owner());
            plugin.setName(entry.name());
            plugin.setHtmlUrl(entry.url());
            plugin.setGithubFullName(githubFullName);
            plugin.setRegistryListed(true);
            if (entry.install() != null && !entry.install().isBlank()) {
                plugin.setInstallLine(entry.install().trim());
            }
            String description = entry.textDescription();
            if (description != null) {
                plugin.setDescription(truncate(description, 2000));
            }
            if (entry.stars() != null) {
                plugin.setStars(entry.stars());
            }
            Instant added = parseAdded(entry.added());
            if (plugin.getCreatedAt() == null && added != null) {
                plugin.setCreatedAt(added);
            }
            if (plugin.getUpdatedAt() == null && added != null) {
                plugin.setUpdatedAt(added);
            }
            if (plugin.getPushedAt() == null && added != null) {
                plugin.setPushedAt(added);
            }
            plugin.setCapability(PluginClassifier.capabilityFromRegistry(entry.category()));
            plugin.setKind(PluginClassifier.kindFromRegistry(entry.category()));
            plugin.setCrawledAt(now);
            applyClassification(plugin);
            pluginRepository.save(plugin);
            saved++;
        }
        log.info("Ingested {} plugins from awesome registry (catalog count {})", saved, catalog.count());
        return saved;
    }

    private int ingestGitHubTopic(Instant now) {
        Map<String, List<Plugin>> byGithub = indexByGithub();
        int saved = 0;
        for (int page = 1; page <= maxPages; page++) {
            GitHubSearchResponse response = gitHubClient.searchTopic(topic, page, 100);
            if (response == null || response.items() == null || response.items().isEmpty()) {
                break;
            }
            for (GitHubSearchResponse.Item item : response.items()) {
                if (PluginClassifier.harnessCore(item.fullName())) {
                    continue;
                }
                List<Plugin> matches = byGithub.get(item.fullName().toLowerCase(Locale.ROOT));
                if (matches != null && !matches.isEmpty()) {
                    for (Plugin plugin : matches) {
                        applyGitHubMetadata(plugin, item, now);
                        applyClassification(plugin);
                        pluginRepository.save(plugin);
                        saved++;
                    }
                } else {
                    Plugin plugin = toPlugin(item, now);
                    pluginRepository.save(plugin);
                    byGithub.computeIfAbsent(item.fullName().toLowerCase(Locale.ROOT), key -> new ArrayList<>()).add(plugin);
                    saved++;
                }
            }
            if (response.items().size() < 100) {
                break;
            }
        }
        log.info("Merged {} GitHub topic rows from {}", saved, topic);
        return saved;
    }

    private void ingestReadmes(Instant now) {
        if (readmeLimit <= 0) {
            return;
        }
        int fetched = 0;
        int pending = 0;
        for (Plugin plugin : pluginRepository.findAll()) {
            if (!needsReadmeRefresh(plugin)) {
                continue;
            }
            if (fetched >= readmeLimit) {
                pending++;
                continue;
            }
            if (fillReadmes(plugin, now)) {
                fetched++;
            }
        }
        log.info("Fetched README locales for {} plugins (limit {}), {} still pending", fetched, readmeLimit, pending);
    }

    private boolean fillReadmes(Plugin plugin, Instant now) {
        try {
            String repo = plugin.getGithubFullName() != null ? plugin.getGithubFullName() : plugin.getId().split("#")[0];
            String owner = GithubRefs.owner(repo);
            String name = GithubRefs.repo(repo);
            if (owner == null || name == null || name.isBlank()) {
                return false;
            }
            Map<String, String> locales = gitHubClient.fetchReadmeLocales(owner, name);
            if (locales.isEmpty()) {
                plugin.setReadmeFetchedAt(now);
                pluginRepository.save(plugin);
                return true;
            }
            plugin.setReadmeLocalesJson(ReadmeLocales.toJson(locales));
            String def = locales.get("default");
            if (def == null || def.isBlank()) {
                def = locales.values().iterator().next();
            }
            plugin.setReadmeMarkdown(def);
            plugin.setReadmeFetchedAt(now);
            pluginRepository.save(plugin);
            return true;
        } catch (Exception ex) {
            log.info("README locales skipped for {}: {}", plugin.getId(), ex.getMessage());
            return false;
        }
    }

    private static boolean needsReadmeRefresh(Plugin plugin) {
        if (plugin.getReadmeFetchedAt() == null || plugin.getReadmeLocalesJson() == null || plugin.getReadmeLocalesJson().isBlank()) {
            return true;
        }
        Instant pushed = plugin.getPushedAt();
        return pushed != null && pushed.isAfter(plugin.getReadmeFetchedAt());
    }

    private void dropGithubDuplicates() {
        Set<String> registryRepos = new HashSet<>();
        List<Plugin> all = pluginRepository.findAll();
        for (Plugin plugin : all) {
            if (plugin.isRegistryListed() && plugin.getGithubFullName() != null) {
                registryRepos.add(plugin.getGithubFullName().toLowerCase(Locale.ROOT));
            }
        }
        for (Plugin plugin : all) {
            if (plugin.isRegistryListed() || plugin.getGithubFullName() == null) {
                continue;
            }
            if (registryRepos.contains(plugin.getGithubFullName().toLowerCase(Locale.ROOT))) {
                pluginRepository.delete(plugin);
            }
        }
    }

    private Map<String, List<Plugin>> indexByGithub() {
        Map<String, List<Plugin>> byGithub = new HashMap<>();
        for (Plugin plugin : pluginRepository.findAll()) {
            String fullName = plugin.getGithubFullName() != null ? plugin.getGithubFullName() : plugin.getId();
            if (fullName.contains("#")) {
                continue;
            }
            byGithub.computeIfAbsent(fullName.toLowerCase(Locale.ROOT), key -> new ArrayList<>()).add(plugin);
        }
        return byGithub;
    }

    private void applyGitHubMetadata(Plugin plugin, GitHubSearchResponse.Item item, Instant now) {
        plugin.setStars(item.stars());
        plugin.setCreatedAt(item.createdAt());
        plugin.setUpdatedAt(item.updatedAt());
        plugin.setPushedAt(item.pushedAt() != null ? item.pushedAt() : item.updatedAt());
        plugin.setHomepage(item.homepage());
        plugin.setLanguage(item.language());
        plugin.setLicense(item.license() != null ? item.license().spdxId() : null);
        plugin.setTopics(item.topics() == null ? "" : item.topics().stream().collect(Collectors.joining(",")));
        plugin.setDefaultBranch(item.defaultBranch());
        plugin.setGithubFullName(item.fullName());
        plugin.setCrawledAt(now);
        if (!plugin.isRegistryListed()) {
            plugin.setHtmlUrl(item.htmlUrl());
            plugin.setDescription(item.description());
            plugin.setCapability(PluginClassifier.capability(plugin.getTopics(), item.name(), item.description()));
            plugin.setKind(PluginClassifier.kind(plugin.getTopics(), item.name(), item.description()));
        }
    }

    private Plugin toPlugin(GitHubSearchResponse.Item item, Instant now) {
        String id = item.fullName();
        Plugin plugin = pluginRepository.findById(id).orElseGet(Plugin::new);
        plugin.setId(id);
        plugin.setOwner(item.owner() != null ? item.owner().login() : id.split("/")[0]);
        plugin.setName(item.name());
        plugin.setGithubFullName(id);
        plugin.setRegistryListed(false);
        applyGitHubMetadata(plugin, item, now);
        applyClassification(plugin);
        return plugin;
    }

    private void applyClassification(Plugin plugin) {
        plugin.setPluginLike(PluginClassifier.pluginLike(
                plugin.isRegistryListed(), plugin.getTopics(), plugin.getName(), plugin.getDescription()));
        plugin.setFeatured(PluginClassifier.featured(
                plugin.isRegistryListed(), plugin.getTopics(), plugin.getName(), plugin.getDescription(), plugin.getStars()));
    }

    private static Instant parseAdded(String added) {
        if (added == null || added.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(added.trim()).atStartOfDay(ZoneOffset.UTC).toInstant();
        } catch (Exception ex) {
            return null;
        }
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
