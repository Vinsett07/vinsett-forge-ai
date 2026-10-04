export type GitHubRepositoryRef = {
  owner: string;
  repo: string;
  fullName: string;
};

export type GitHubIssueSummary = {
  number: number;
  title: string;
  state: "open" | "closed";
  htmlUrl: string;
  labels: string[];
  updatedAt: string;
};

export type GitHubPullRequestSummary = {
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  merged: boolean;
  htmlUrl: string;
  updatedAt: string;
};

export type GitHubCommitSummary = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  committedAt: string;
  htmlUrl: string;
};

export type GitHubWorkflowRunSummary = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  event: string;
  branch: string | null;
  htmlUrl: string;
  updatedAt: string;
};

export type GitHubRateLimit = {
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};

export type GitHubRepositorySnapshot = {
  repository: {
    id: number;
    owner: string;
    name: string;
    fullName: string;
    htmlUrl: string;
    description: string | null;
    defaultBranch: string;
    visibility: string;
    archived: boolean;
    openIssuesCount: number;
    pushedAt: string | null;
  };
  issues: GitHubIssueSummary[];
  pullRequests: GitHubPullRequestSummary[];
  commits: GitHubCommitSummary[];
  workflowRuns: GitHubWorkflowRunSummary[];
  rateLimit: GitHubRateLimit;
  syncedAt: string;
};

export type ReleaseReadinessCheck = {
  key: "repository" | "recent_commit" | "blocking_issues" | "pull_requests" | "ci";
  label: string;
  state: "pass" | "warn" | "fail";
  detail: string;
};

const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

export function parseGitHubRepositoryRef(value: unknown): GitHubRepositoryRef {
  if (typeof value !== "string") throw new Error("invalid_repository");
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) throw new Error("invalid_repository");

  let candidate = trimmed;
  if (candidate.startsWith("git@github.com:")) candidate = candidate.slice("git@github.com:".length);
  else if (/^https?:\/\/github\.com\//i.test(candidate)) candidate = candidate.replace(/^https?:\/\/github\.com\//i, "");
  else if (/^github\.com\//i.test(candidate)) candidate = candidate.replace(/^github\.com\//i, "");

  candidate = candidate.replace(/\.git$/i, "");
  const parts = candidate.split("/").filter(Boolean);
  if (parts.length !== 2) throw new Error("invalid_repository");
  const [owner, repo] = parts;
  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) throw new Error("invalid_repository");
  return { owner, repo, fullName: `${owner}/${repo}` };
}

export function buildReleaseReadiness(snapshot: GitHubRepositorySnapshot, now = new Date()): ReleaseReadinessCheck[] {
  const checks: ReleaseReadinessCheck[] = [];
  checks.push({
    key: "repository",
    label: "Repositório acessível",
    state: snapshot.repository.archived ? "warn" : "pass",
    detail: snapshot.repository.archived ? "O repositório está arquivado." : `${snapshot.repository.fullName} sincronizado com sucesso.`,
  });

  const latestCommit = snapshot.commits[0];
  if (!latestCommit) {
    checks.push({ key: "recent_commit", label: "Commit recente", state: "fail", detail: "Nenhum commit foi retornado para a branch padrão." });
  } else {
    const ageMs = Math.max(0, now.getTime() - new Date(latestCommit.committedAt).getTime());
    const ageDays = Math.floor(ageMs / 86_400_000);
    checks.push({
      key: "recent_commit",
      label: "Commit recente",
      state: ageDays <= 30 ? "pass" : "warn",
      detail: ageDays <= 30 ? `Último commit há ${ageDays} dia(s).` : `Último commit há ${ageDays} dias; confirme se a branch está ativa.`,
    });
  }

  const blockerLabels = new Set(["blocker", "blocked", "critical", "release-blocker", "release blocker", "p0"]);
  const blockingIssues = snapshot.issues.filter((issue) => issue.state === "open" && issue.labels.some((label) => blockerLabels.has(label.toLowerCase())));
  checks.push({
    key: "blocking_issues",
    label: "Bloqueadores conhecidos",
    state: blockingIssues.length === 0 ? "pass" : "fail",
    detail: blockingIssues.length === 0 ? "Nenhuma issue aberta com rótulo de bloqueio conhecido." : `${blockingIssues.length} issue(s) aberta(s) marcada(s) como bloqueadora(s).`,
  });

  const openPulls = snapshot.pullRequests.filter((pr) => pr.state === "open");
  const nonDraftOpenPulls = openPulls.filter((pr) => !pr.draft);
  checks.push({
    key: "pull_requests",
    label: "Pull requests abertas",
    state: nonDraftOpenPulls.length === 0 ? "pass" : "warn",
    detail: nonDraftOpenPulls.length === 0 ? (openPulls.length ? `${openPulls.length} PR(s) aberta(s), todas em draft.` : "Nenhuma PR aberta aguardando merge.") : `${nonDraftOpenPulls.length} PR(s) não-draft ainda aberta(s).`,
  });

  const latestRun = snapshot.workflowRuns[0];
  if (!latestRun) {
    checks.push({ key: "ci", label: "CI recente", state: "warn", detail: "Nenhuma execução de GitHub Actions foi encontrada." });
  } else if (latestRun.status !== "completed") {
    checks.push({ key: "ci", label: "CI recente", state: "warn", detail: `Último workflow ainda está em estado ${latestRun.status}.` });
  } else if (latestRun.conclusion === "success" || latestRun.conclusion === "neutral" || latestRun.conclusion === "skipped") {
    checks.push({ key: "ci", label: "CI recente", state: "pass", detail: `Último workflow concluído como ${latestRun.conclusion}.` });
  } else {
    checks.push({ key: "ci", label: "CI recente", state: "fail", detail: `Último workflow concluiu como ${latestRun.conclusion ?? "desconhecido"}.` });
  }

  return checks;
}
