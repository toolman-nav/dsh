package market.bay.plugin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ReadmeLocales {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<LinkedHashMap<String, String>> TYPE = new TypeReference<>() {
    };

    private ReadmeLocales() {
    }

    public static String toJson(Map<String, String> locales) {
        if (locales == null || locales.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(locales);
        } catch (Exception ex) {
            return null;
        }
    }

    public static Map<String, String> parse(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            LinkedHashMap<String, String> parsed = MAPPER.readValue(json, TYPE);
            return parsed == null ? Map.of() : parsed;
        } catch (Exception ex) {
            return Map.of();
        }
    }

    public static String pick(Map<String, String> locales, String readmeMarkdown, boolean chinese) {
        Map<String, String> map = locales == null ? Map.of() : locales;
        if (chinese) {
            if (notBlank(map.get("zh"))) {
                return map.get("zh");
            }
            if (notBlank(map.get("zh-TW"))) {
                return map.get("zh-TW");
            }
        } else if (notBlank(map.get("en"))) {
            return map.get("en");
        }
        if (notBlank(map.get("default"))) {
            return map.get("default");
        }
        if (notBlank(readmeMarkdown)) {
            return readmeMarkdown;
        }
        return map.values().stream().filter(ReadmeLocales::notBlank).findFirst().orElse("");
    }

    private static boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
