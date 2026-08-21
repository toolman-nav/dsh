package market.bay.plugin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PluginRepository extends JpaRepository<Plugin, String> {

    List<Plugin> findTop6ByFeaturedTrueOrderByStarsDesc();

    List<Plugin> findTop6ByPluginLikeTrueOrderByPushedAtDesc();

    List<Plugin> findTop6ByPluginLikeTrueOrderByStarsDesc();

    @Query("""
            SELECT p FROM Plugin p
            WHERE (:q = '' OR lower(p.id) LIKE lower(concat('%', :q, '%'))
                OR lower(coalesce(p.description, '')) LIKE lower(concat('%', :q, '%'))
                OR lower(p.owner) LIKE lower(concat('%', :q, '%'))
                OR lower(coalesce(p.topics, '')) LIKE lower(concat('%', :q, '%'))
                OR lower(coalesce(p.capability, '')) LIKE lower(concat('%', :q, '%'))
                OR lower(coalesce(p.kind, '')) LIKE lower(concat('%', :q, '%')))
              AND (:capability = '' OR p.capability = :capability)
              AND (:kind = '' OR p.kind = :kind)
              AND (:featured = false OR p.featured = true)
              AND (:includeAll = true OR p.pluginLike = true)
            """)
    Page<Plugin> search(
            @Param("q") String q,
            @Param("capability") String capability,
            @Param("kind") String kind,
            @Param("featured") boolean featured,
            @Param("includeAll") boolean includeAll,
            Pageable pageable
    );

    long countByPluginLikeTrue();

    @Query("""
            SELECT new market.bay.plugin.CatalogItem(
                p.id, p.owner, p.name, p.description, p.stars, p.pushedAt, p.createdAt,
                p.htmlUrl, p.homepage, p.language, p.license, p.topics, p.capability, p.kind,
                p.featured, p.pluginLike, p.installLine, p.githubFullName, p.defaultBranch)
            FROM Plugin p
            """)
    List<CatalogItem> findCatalogItems();
}
