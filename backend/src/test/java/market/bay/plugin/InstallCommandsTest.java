package market.bay.plugin;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class InstallCommandsTest {

    @Test
    void acceptsExpectedDshInstallCommands() {
        assertEquals(
                "dsh plugin --profile web add @acme/example@1.2.3",
                InstallCommands.trusted("dsh plugin --profile web add @acme/example@1.2.3")
        );
        assertEquals(
                "dsh plugin --profile web add \"https://github.com/acme/example/releases/download/v1/example.tgz\"",
                InstallCommands.trusted("dsh plugin --profile web add \"https://github.com/acme/example/releases/download/v1/example.tgz\"")
        );
    }

    @Test
    void rejectsShellOperatorsAndAdditionalCommands() {
        assertNull(InstallCommands.trusted("dsh plugin --profile web add example; curl evil.test"));
        assertNull(InstallCommands.trusted("dsh plugin --profile web add example\nwhoami"));
        assertNull(InstallCommands.trusted("npm install example"));
    }
}
