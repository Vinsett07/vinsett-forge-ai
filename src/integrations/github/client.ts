import type { GitHubRepositoryRef, GitHubRepositorySnapshot } from "../../domain/github.ts";

const API_VERSION = "2026-03-10";

type FetchLike = typeof fetch;

function headers(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "vinsett-forge-ai",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getJson<T>(url: string, token: string | undefined, fetcher: FetchLike): Promise<{ data: T; headers: Headers }> {
  const response = await fetcher(url, { headers: headers(token), cache: "no-store" });
  if (!response.ok) throw new Error(`github_${response.status}`);
  return { data: await response.json() as T, headers: response.headers };
}

export async function fetchGitHubRepositorySnapshot(ref: GitHubRepositoryRef, options: { token?: string; fetcher?: FetchLike } = {}): Promise<GitHubRepositorySnapshot> {
  const fetcher = options.fetcher ?? fetch;
  const token = options.token;
  const root = `https://api.github.com/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`;

  const repoResponse = await getJson<any>(root, token, fetcher);
  const repo = repoResponse.data;
  const branch = repo.default_branch as string;
  const [issuesResponse, pullsResponse, commitsResponse, runsResponse] = await Promise.all([
    getJson<any[]>(`${root}/issues?state=all&sort=updated&direction=desc&per_page=20`, token, fetcher),
    getJson<any[]>(`${root}/pulls?state=all&sort=updated&direction=desc&per_page=20`, token, fetcher),
    getJson<any[]>(`${root}/commits?sha=${encodeURIComponent(branch)}&per_page=20`, token, fetcher),
    getJson<any>(`${root}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=10`, token, fetcher).catch(() => ({ data: { workflow_runs: [] }, headers: new Headers() })),
  ]);

  const limit = Number(repoResponse.headers.get("x-ratelimit-limit"));
  const remaining = Number(repoResponse.headers.get("x-ratelimit-remaining"));
  const reset = Number(repoResponse.headers.get("x-ratelimit-reset"));

  return {
    repository: {
      id: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      description: repo.description ?? null,
      defaultBranch: branch,
      visibility: repo.visibility ?? (repo.private ? "private" : "public"),
      archived: Boolean(repo.archived),
      openIssuesCount: Number(repo.open_issues_count ?? 0),
      pushedAt: repo.pushed_at ?? null,
    },
    issues: issuesResponse.data.filter((item) => !item.pull_request).map((item) => ({
      number: item.number,
      title: item.title,
      state: item.state,
      htmlUrl: item.html_url,
      labels: (item.labels ?? []).map((label: any) => typeof label === "string" ? label : label.name).filter(Boolean),
      updatedAt: item.updated_at,
    })),
    pullRequests: pullsResponse.data.map((item) => ({
      number: item.number,
      title: item.title,
      state: item.state,
      draft: Boolean(item.draft),
      merged: Boolean(item.merged_at),
      htmlUrl: item.html_url,
      updatedAt: item.updated_at,
    })),
    commits: commitsResponse.data.map((item) => ({
      sha: item.sha,
      shortSha: String(item.sha).slice(0, 7),
      message: String(item.commit?.message ?? "").split("\n")[0],
      author: item.commit?.author?.name ?? item.author?.login ?? "unknown",
      committedAt: item.commit?.committer?.date ?? item.commit?.author?.date,
      htmlUrl: item.html_url,
    })),
    workflowRuns: (runsResponse.data.workflow_runs ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      conclusion: item.conclusion ?? null,
      event: item.event,
      branch: item.head_branch ?? null,
      htmlUrl: item.html_url,
      updatedAt: item.updated_at,
    })),
    rateLimit: {
      limit: Number.isFinite(limit) ? limit : null,
      remaining: Number.isFinite(remaining) ? remaining : null,
      resetAt: Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toISOString() : null,
    },
    syncedAt: new Date().toISOString(),
  };
}
