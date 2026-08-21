package market.bay.plugin;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ReadmeNames {

    private static final Pattern FILE = Pattern.compile(
            "(?i)^readme(?:[._-](?<locale>[a-z]{2}(?:[-_][a-z0-9]+)?))?(?:\\.(?<ext>md|markdown|rst|txt))?$");

    private ReadmeNames() {
    }

    public static boolean isReadmeFile(String name) {
        return name != null && FILE.matcher(name.trim()).matches();
    }

    public static String localeOf(String name) {
        if (name == null) {
            return "default";
        }
        Matcher matcher = FILE.matcher(name.trim());
        if (!matcher.matches()) {
            return "default";
        }
        String locale = matcher.group("locale");
        if (locale == null || locale.isBlank()) {
            return "default";
        }
        return normalize(locale);
    }

    static String normalize(String locale) {
        String value = locale.replace('_', '-').toLowerCase(Locale.ROOT);
        if (value.equals("zh") || value.equals("cn") || value.startsWith("zh-cn") || value.equals("zh-hans")) {
            return "zh";
        }
        if (value.startsWith("zh-tw") || value.equals("zh-hant") || value.equals("zh-hk") || value.equals("zh-mo")) {
            return "zh-TW";
        }
        if (value.startsWith("en")) {
            return "en";
        }
        if (value.equals("jp") || value.startsWith("ja")) {
            return "ja";
        }
        if (value.equals("kr") || value.startsWith("ko")) {
            return "ko";
        }
        return value;
    }
}
