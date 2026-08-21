package market.bay.config;

import market.bay.github.GitHubCrawler;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "OPTIONS");
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
