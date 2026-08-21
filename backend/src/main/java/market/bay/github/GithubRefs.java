package market.bay.github;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class GithubRefs {

    private static final Pattern REPO = Pattern.compile("https?://github\\.com/([^/]+)/([^/#?]+)", Pattern.CASE_INSENSITIVE);

    private GithubRefs() {
    }

    public static String fullName(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        Matcher matcher = REPO.matcher(url.trim());
        if (!matcher.find()) {
            return null;
        }
        String repo = matcher.group(2);
        if (repo.endsWith(".git")) {
            repo = repo.substring(0, repo.length() - 4);
        }
        return matcher.group(1) + "/" + repo;
    }

    public static String owner(String fullName) {
        if (fullName == null) {
            return null;
        }
        int slash = fullName.indexOf('/');
        return slash < 0 ? fullName : fullName.substring(0, slash);
    }

    public static String repo(String fullName) {
        if (fullName == null) {
            return null;
        }
        int slash = fullName.indexOf('/');
        return slash < 0 ? fullName : fullName.substring(slash + 1);
    }
}
