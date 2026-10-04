import test from "node:test";
import assert from "node:assert/strict";
import { fetchGitHubRepositorySnapshot } from "../src/integrations/github/client.ts";

const json = (value: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json", ...headers } });

test("GitHub client composes repository, issues, pulls, commits and actions", async () => {
  const seen: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); seen.push(url);
    assert.equal((init?.headers as Record<string, string>)["X-GitHub-Api-Version"], "2026-03-10");
    if (url.endsWith("/repos/Vinsett07/forge")) return json({ id: 1, name: "forge", full_name: "Vinsett07/forge", owner: { login: "Vinsett07" }, html_url: "https://github.com/Vinsett07/forge", default_branch: "main", private: false, archived: false, open_issues_count: 2, pushed_at: "2026-10-01T00:00:00Z" }, { "x-ratelimit-limit": "60", "x-ratelimit-remaining": "59" });
    if (url.includes("/issues?")) return json([{ number: 1, title: "issue", state: "open", html_url: "i", labels: [{ name: "bug" }], updated_at: "2026-10-01T00:00:00Z" }, { number: 2, title: "pr-as-issue", state: "open", html_url: "p", labels: [], updated_at: "2026-10-01T00:00:00Z", pull_request: {} }]);
    if (url.includes("/pulls?")) return json([{ number: 2, title: "PR", state: "open", draft: false, merged_at: null, html_url: "p", updated_at: "2026-10-01T00:00:00Z" }]);
    if (url.includes("/commits?")) return json([{ sha: "abcdef123456", html_url: "c", commit: { message: "feat: thing\nbody", author: { name: "G" }, committer: { date: "2026-10-01T00:00:00Z" } } }]);
    if (url.includes("/actions/runs?")) return json({ workflow_runs: [{ id: 9, name: "CI", status: "completed", conclusion: "success", event: "push", head_branch: "main", html_url: "a", updated_at: "2026-10-01T00:00:00Z" }] });
    return new Response("not found", { status: 404 });
  };

  const result = await fetchGitHubRepositorySnapshot({ owner: "Vinsett07", repo: "forge", fullName: "Vinsett07/forge" }, { fetcher });
  assert.equal(result.issues.length, 1);
  assert.equal(result.pullRequests.length, 1);
  assert.equal(result.commits[0].shortSha, "abcdef1");
  assert.equal(result.workflowRuns[0].conclusion, "success");
  assert.equal(result.rateLimit.remaining, 59);
  assert.equal(seen.length, 5);
});
