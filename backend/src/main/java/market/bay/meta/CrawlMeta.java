package market.bay.meta;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "crawl_meta")
public class CrawlMeta {

    @Id
    private String id = "default";

    private Instant lastCrawledAt;
    private int lastCount;
    private String lastError;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getLastCrawledAt() {
        return lastCrawledAt;
    }

    public void setLastCrawledAt(Instant lastCrawledAt) {
        this.lastCrawledAt = lastCrawledAt;
    }

    public int getLastCount() {
        return lastCount;
    }

    public void setLastCount(int lastCount) {
        this.lastCount = lastCount;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }
}
