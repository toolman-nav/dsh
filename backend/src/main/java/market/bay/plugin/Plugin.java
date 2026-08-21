package market.bay.plugin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "plugins")
public class Plugin {

    @Id
    private String id;

    private String owner;
    private String name;

    @Column(length = 2000)
    private String description;

    private long stars;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant pushedAt;
    private String htmlUrl;
    private String homepage;
    private String language;
    private String license;

    @Column(length = 2000)
    private String topics;

    private String capability;
    private String kind;
    private boolean pluginLike;
    private boolean featured;
    private Boolean registryListed;
    private Instant registryLastSeenAt;
    private String githubFullName;

    @Column(length = 400)
    private String installLine;

    private String defaultBranch;
    private Instant crawledAt;

    @Lob
    private String readmeMarkdown;

    @Lob
    private String readmeLocalesJson;

    private Instant readmeFetchedAt;

    public String installCommand() {
        if (installLine != null && !installLine.isBlank()) {
            return installLine;
        }
        String spec = githubFullName != null && !githubFullName.isBlank() ? githubFullName : id;
        return "dsh plugin --profile web add github:" + spec;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getStars() {
        return stars;
    }

    public void setStars(long stars) {
        this.stars = stars;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getPushedAt() {
        return pushedAt;
    }

    public void setPushedAt(Instant pushedAt) {
        this.pushedAt = pushedAt;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public String getHomepage() {
        return homepage;
    }

    public void setHomepage(String homepage) {
        this.homepage = homepage;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getTopics() {
        return topics;
    }

    public void setTopics(String topics) {
        this.topics = topics;
    }

    public String getCapability() {
        return capability;
    }

    public void setCapability(String capability) {
        this.capability = capability;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public boolean isPluginLike() {
        return pluginLike;
    }

    public void setPluginLike(boolean pluginLike) {
        this.pluginLike = pluginLike;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public boolean isRegistryListed() {
        return Boolean.TRUE.equals(registryListed);
    }

    public void setRegistryListed(boolean registryListed) {
        this.registryListed = registryListed;
    }

    public Instant getRegistryLastSeenAt() {
        return registryLastSeenAt;
    }

    public void setRegistryLastSeenAt(Instant registryLastSeenAt) {
        this.registryLastSeenAt = registryLastSeenAt;
    }

    public String getGithubFullName() {
        return githubFullName;
    }

    public void setGithubFullName(String githubFullName) {
        this.githubFullName = githubFullName;
    }

    public String getInstallLine() {
        return installLine;
    }

    public void setInstallLine(String installLine) {
        this.installLine = installLine;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public Instant getCrawledAt() {
        return crawledAt;
    }

    public void setCrawledAt(Instant crawledAt) {
        this.crawledAt = crawledAt;
    }

    public String getReadmeMarkdown() {
        return readmeMarkdown;
    }

    public void setReadmeMarkdown(String readmeMarkdown) {
        this.readmeMarkdown = readmeMarkdown;
    }

    public String getReadmeLocalesJson() {
        return readmeLocalesJson;
    }

    public void setReadmeLocalesJson(String readmeLocalesJson) {
        this.readmeLocalesJson = readmeLocalesJson;
    }

    public Instant getReadmeFetchedAt() {
        return readmeFetchedAt;
    }

    public void setReadmeFetchedAt(Instant readmeFetchedAt) {
        this.readmeFetchedAt = readmeFetchedAt;
    }
}
