"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { GitHubRepositorySnapshot, ReleaseReadinessCheck } from "@/src/domain/github";

type Integration = {
  repositoryFullName: string;
  repositoryUrl: string;
  defaultBranch: string;
  visibility: string;
  syncStatus: "never" | "ok" | "error";
  lastError: string | null;
  snapshot: GitHubRepositorySnapshot | null;
  lastSyncedAt: string | null;
};

export function GitHubIntegrationPanel({ projectId, integration, readiness }: { projectId: string; integration: Integration | null; readiness: ReleaseReadinessCheck[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function link(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const repository = String(new FormData(event.currentTarget).get("repository") ?? "");
    const response = await fetch(`/api/projects/${projectId}/github/link`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ repository }) });
    if (!response.ok) setError("Não foi possível conectar o repositório. Confirme owner/repo e a visibilidade.");
    else router.refresh();
    setBusy(false);
  }

  async function sync() {
    setBusy(true); setError("");
    const response = await fetch(`/api/projects/${projectId}/github/sync`, { method: "POST" });
    if (!response.ok) setError("A sincronização com o GitHub falhou.");
    else router.refresh();
    setBusy(false);
  }

  async function unlink() {
    if (!window.confirm("Desconectar este repositório do projeto? O histórico do projeto será preservado.")) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/projects/${projectId}/github/link`, { method: "DELETE" });
    if (!response.ok) setError("Não foi possível desconectar o repositório.");
    else router.refresh();
    setBusy(false);
  }

  const snapshot = integration?.snapshot;

  return (
    <section className="github-panel">
      <div className="github-heading">
        <div><span className="eyebrow">GITHUB CONTEXT</span><h2>Repositório e release readiness</h2></div>
        <p>Sincronização somente leitura de issues, pull requests, commits e GitHub Actions. Nenhum código ou issue é alterado pelo Forge.</p>
      </div>
      {error && <p className="error delivery-error" role="alert">{error}</p>}

      {!integration ? (
        <form className="github-link-form" onSubmit={link}>
          <label>Repositório GitHub<input name="repository" required placeholder="owner/repository ou https://github.com/owner/repository" /></label>
          <button className="primary button" disabled={busy}>{busy ? "Conectando..." : "Conectar repositório"}</button>
          <small>Repositórios públicos funcionam sem token. Para privados, configure GITHUB_TOKEN apenas no servidor.</small>
        </form>
      ) : (
        <>
          <div className="github-repo-card">
            <div>
              <span className={`sync-dot sync-${integration.syncStatus}`}>{integration.syncStatus}</span>
              <a href={integration.repositoryUrl} target="_blank" rel="noreferrer"><strong>{integration.repositoryFullName}</strong></a>
              <p>{integration.visibility} • branch padrão: <code>{integration.defaultBranch}</code>{integration.lastSyncedAt ? ` • sincronizado em ${new Date(integration.lastSyncedAt).toLocaleString("pt-BR")}` : ""}</p>
            </div>
            <div className="github-actions"><button className="secondary button" onClick={sync} disabled={busy}>Sincronizar</button><button className="danger button" onClick={unlink} disabled={busy}>Desconectar</button></div>
          </div>
          {integration.lastError && <p className="error">Último erro: {integration.lastError}</p>}

          {snapshot && (
            <>
              <div className="repo-metrics">
                <div><strong>{snapshot.issues.filter((i) => i.state === "open").length}</strong><span>Issues abertas</span></div>
                <div><strong>{snapshot.pullRequests.filter((pr) => pr.state === "open").length}</strong><span>PRs abertas</span></div>
                <div><strong>{snapshot.commits.length}</strong><span>Commits recentes</span></div>
                <div><strong>{snapshot.workflowRuns[0]?.conclusion ?? "—"}</strong><span>Último CI</span></div>
              </div>

              <div className="readiness-grid">
                {readiness.map((check) => <article className={`readiness readiness-${check.state}`} key={check.key}><span>{check.state}</span><strong>{check.label}</strong><p>{check.detail}</p></article>)}
              </div>

              <div className="github-context-grid">
                <section><h3>Commits recentes</h3>{snapshot.commits.slice(0, 5).map((commit) => <a className="github-list-item" href={commit.htmlUrl} target="_blank" rel="noreferrer" key={commit.sha}><code>{commit.shortSha}</code><span>{commit.message}</span><small>{commit.author}</small></a>)}</section>
                <section><h3>Pull requests</h3>{snapshot.pullRequests.slice(0, 5).map((pr) => <a className="github-list-item" href={pr.htmlUrl} target="_blank" rel="noreferrer" key={pr.number}><code>#{pr.number}</code><span>{pr.title}</span><small>{pr.state}{pr.draft ? " • draft" : ""}</small></a>)}</section>
                <section><h3>Issues</h3>{snapshot.issues.slice(0, 5).map((issue) => <a className="github-list-item" href={issue.htmlUrl} target="_blank" rel="noreferrer" key={issue.number}><code>#{issue.number}</code><span>{issue.title}</span><small>{issue.labels.join(", ") || issue.state}</small></a>)}</section>
              </div>
              {snapshot.rateLimit.remaining !== null && <p className="rate-note">GitHub API: {snapshot.rateLimit.remaining}/{snapshot.rateLimit.limit ?? "?"} requisições restantes nesta janela.</p>}
            </>
          )}
        </>
      )}
    </section>
  );
}
