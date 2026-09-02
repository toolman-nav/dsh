package market.bay.github;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class GithubRefsTest {

    @Test
    void extractsRepositoryAndMonorepoSubpath() {
        String url = "https://github.com/acme/plugins/tree/main/packages/example";
        assertEquals("acme/plugins", GithubRefs.fullName(url));
        assertEquals("packages/example", GithubRefs.subpath(url, "main"));
    }

    @Test
    void supportsBranchNamesContainingSlashes() {
        String url = "https://github.com/acme/plugins/tree/release/v2/packages/example";
        assertEquals("packages/example", GithubRefs.subpath(url, "release/v2"));
    }

    @Test
    void rejectsUrlsThatOnlyContainAGithubUrl() {
        assertNull(GithubRefs.fullName("javascript:https://github.com/acme/plugins"));
    }
}
