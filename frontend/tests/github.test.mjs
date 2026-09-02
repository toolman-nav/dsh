import test from "node:test";
import assert from "node:assert/strict";
import { githubRepo, rawGithubUrl, resolveRepoPath } from "../src/github.js";

test("parses a GitHub monorepo plugin path", () => {
  const repo = githubRepo({
    htmlUrl: "https://github.com/acme/plugins/tree/main/packages/example",
    defaultBranch: "main",
  });
  assert.deepEqual(repo, {
    owner: "acme",
    name: "plugins",
    branch: "main",
    basePath: "packages/example",
  });
});

test("supports configured branch names containing slashes", () => {
  const repo = githubRepo({
    htmlUrl: "https://github.com/acme/plugins/tree/release/v2/packages/example",
    defaultBranch: "release/v2",
  });
  assert.equal(repo.branch, "release/v2");
  assert.equal(repo.basePath, "packages/example");
});

test("resolves relative README resources inside the plugin directory", () => {
  assert.equal(resolveRepoPath("../assets/logo.png", "packages/example/docs"), "packages/example/assets/logo.png");
  assert.equal(
    rawGithubUrl(
      { htmlUrl: "https://github.com/acme/plugins/tree/main/packages/example", defaultBranch: "main" },
      "images/screen shot.png"
    ),
    "https://raw.githubusercontent.com/acme/plugins/main/packages/example/images/screen%20shot.png"
  );
});

test("rejects non-GitHub repository URLs", () => {
  const repo = githubRepo({ htmlUrl: "javascript:https://github.com/acme/plugins" });
  assert.equal(repo.owner, undefined);
});
