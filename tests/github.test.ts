import test from "node:test";
import assert from "node:assert/strict";
import { buildReleaseReadiness, parseGitHubRepositoryRef, type GitHubRepositorySnapshot } from "../src/domain/github.ts";

test("parseGitHubRepositoryRef accepts common GitHub formats", () => {
  assert.deepEqual(parseGitHubRepositoryRef("Vinsett07/vinsett-forge-ai"), { owner: "Vinsett07", repo: "vinsett-forge-ai", fullName: "Vinsett07/vinsett-forge-ai" });
  assert.equal(parseGitHubRepositoryRef("https://github.com/Vinsett07/vinsett-forge-ai.git").fullName, "Vinsett07/vinsett-forge-ai");
  assert.equal(parseGitHubRepositoryRef("git@github.com:Vinsett07/vinsett-forge-ai.git").fullName, "Vinsett07/vinsett-forge-ai");
  assert.throws(() => parseGitHubRepositoryRef("https://example.com/a/b"), /invalid_repository/);
});

function snapshot(): GitHubRepositorySnapshot {
  return {
    repository: { id: 1, owner: "Vinsett07", name: "forge", fullName: "Vinsett07/forge", htmlUrl: "https://github.com/Vinsett07/forge", description: null, defaultBranch: "main", visibility: "public", archived: false, openIssuesCount: 0, pushedAt: "2026-10-01T12:00:00Z" },
    issues: [],
    pullRequests: [],
    commits: [{ sha: "abcdef123", shortSha: "abcdef1", message: "release", author: "Gustavo", committedAt: "2026-10-01T12:00:00Z", htmlUrl: "https://github.com/commit" }],
    workflowRuns: [{ id: 1, name: "CI", status: "completed", conclusion: "success", event: "push", branch: "main", htmlUrl: "https://github.com/actions/1", updatedAt: "2026-10-01T12:10:00Z" }],
    rateLimit: { limit: 60, remaining: 50, resetAt: null },
    syncedAt: "2026-10-01T12:15:00Z",
  };
}

test("release readiness passes a clean repository snapshot", () => {
  const checks = buildReleaseReadiness(snapshot(), new Date("2026-10-02T12:00:00Z"));
  assert.equal(checks.filter((item) => item.state === "fail").length, 0);
  assert.equal(checks.find((item) => item.key === "ci")?.state, "pass");
});

test("release readiness flags blocker issues and failed CI", () => {
  const data = snapshot();
  data.issues.push({ number: 7, title: "Broken release", state: "open", htmlUrl: "https://github.com/issues/7", labels: ["release-blocker"], updatedAt: "2026-10-01T12:00:00Z" });
  data.workflowRuns[0].conclusion = "failure";
  const checks = buildReleaseReadiness(data, new Date("2026-10-02T12:00:00Z"));
  assert.equal(checks.find((item) => item.key === "blocking_issues")?.state, "fail");
  assert.equal(checks.find((item) => item.key === "ci")?.state, "fail");
});
