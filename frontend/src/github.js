function pathParts(url) {
  try {
    const parsed = new URL(String(url || ""));
    if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
      return [];
    }
    return parsed.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return [];
  }
}

export function githubRepo(plugin = {}) {
  const parts = pathParts(plugin.htmlUrl);
  if (parts.length >= 2) {
    const owner = parts[0];
    const name = parts[1].replace(/\.git$/i, "");
    const kind = parts[2];
    if ((kind === "tree" || kind === "blob") && parts[3]) {
      const configuredBranch = String(plugin.defaultBranch || "").split("/").filter(Boolean);
      const branchMatches = configuredBranch.length > 0
        && configuredBranch.every((part, index) => parts[index + 3] === part);
      const branchParts = branchMatches ? configuredBranch : [parts[3]];
      const baseIndex = 3 + branchParts.length;
      const fileParts = parts.slice(baseIndex);
      const basePath = kind === "blob" ? fileParts.slice(0, -1).join("/") : fileParts.join("/");
      return { owner, name, branch: branchParts.join("/"), basePath };
    }
    return { owner, name, branch: plugin.defaultBranch || "main", basePath: "" };
  }
  const name = String(plugin.name || "").split("#")[0];
  return { owner: plugin.owner, name, branch: plugin.defaultBranch || "main", basePath: "" };
}

export function resolveRepoPath(href, basePath = "") {
  const trimmed = String(href || "").trim();
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/^\/+/, "");
  }
  const stack = basePath ? basePath.split("/").filter(Boolean) : [];
  for (const part of trimmed.replace(/^\.\//, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join("/");
}

export function githubBlobToRaw(url) {
  const match = String(url || "").match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/);
  if (!match) return url;
  return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
}

export function rawGithubUrl(plugin, relativePath) {
  const repo = githubRepo(plugin);
  const path = resolveRepoPath(relativePath, repo.basePath);
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/${repo.branch.split("/").map(encodeURIComponent).join("/")}/${encodedPath}`;
}
