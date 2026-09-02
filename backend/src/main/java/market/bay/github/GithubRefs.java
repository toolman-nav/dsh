package market.bay.github;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class GithubRefs {

    private static final Pattern REPO = Pattern.compile("^https://github\\.com/([^/]+)/([^/#?]+)(?:[/?#].*)?$", Pattern.CASE_INSENSITIVE);

    private GithubRefs() {
    }

    public static String fullName(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        Matcher matcher = REPO.matcher(url.trim());
        if (!matcher.matches()) {
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

    public static String subpath(String url, String defaultBranch) {
        if (fullName(url) == null) {
            return "";
        }
        try {
            List<String> parts = Arrays.stream(URI.create(url.trim()).getPath().split("/"))
                    .filter(part -> !part.isBlank())
                    .toList();
            if (parts.size() < 5 || !("tree".equals(parts.get(2)) || "blob".equals(parts.get(2)))) {
                return "";
            }
            List<String> branch = defaultBranch == null || defaultBranch.isBlank()
                    ? List.of(parts.get(3))
                    : Arrays.stream(defaultBranch.split("/")).filter(part -> !part.isBlank()).toList();
            boolean branchMatches = parts.size() >= 3 + branch.size();
            for (int i = 0; branchMatches && i < branch.size(); i++) {
                branchMatches = branch.get(i).equals(parts.get(i + 3));
            }
            int start = 3 + (branchMatches ? branch.size() : 1);
            int end = "blob".equals(parts.get(2)) ? parts.size() - 1 : parts.size();
            return start < end ? String.join("/", parts.subList(start, end)) : "";
        } catch (Exception ex) {
            return "";
        }
    }
}
