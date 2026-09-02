package market.bay.plugin;

import java.util.regex.Pattern;

public final class InstallCommands {

    private static final Pattern SAFE = Pattern.compile(
            "^dsh plugin --profile [A-Za-z0-9._-]+ add (?:\\\"[A-Za-z0-9@._:/#?=&%+~-]+\\\"|[A-Za-z0-9@._:/#?=&%+~-]+)$"
    );

    private InstallCommands() {
    }

    public static String trusted(String candidate) {
        if (candidate == null) {
            return null;
        }
        String command = candidate.trim();
        return SAFE.matcher(command).matches() ? command : null;
    }
}
