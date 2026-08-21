package market.bay.plugin;

public final class PluginIds {

    private PluginIds() {
    }

    public static String of(String owner, String name) {
        return owner + "/" + safeSegment(name);
    }

    public static String safeSegment(String name) {
        if (name == null) {
            return "";
        }
        return name.replace("#", "--").replace("/", "--");
    }
}
