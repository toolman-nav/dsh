package market.bay.config;

import market.bay.github.GitHubCrawler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${bay.cors.allowed-origins:https://dshpluginlist.com}") String allowedOrigins) {
        this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "OPTIONS");
    }

    @Bean
    ApplicationRunner crawlAtBoot(GitHubCrawler crawler) {
        return args -> {
            crawler.reclassifyAll();
            Thread worker = new Thread(crawler::crawl, "bay-github-crawl");
            worker.setDaemon(true);
            worker.start();
        };
    }
}
