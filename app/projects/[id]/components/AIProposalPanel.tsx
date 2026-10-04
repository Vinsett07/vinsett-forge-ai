"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AiWorkspaceProposal } from "@/src/domain/ai-proposal";

type ProposalView = {
  id: string;
  status: "pending" | "approved" | "rejected";
  provider: string;
  model: string;
  promptVersion: string;
  proposal: AiWorkspaceProposal;
  createdAt: string;
};

export function AIProposalPanel({ projectId, proposals: initial }: { projectId: string; proposals: ProposalView[] }) {
  const router = useRouter();
  const [proposals, setProposals] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true); setError("");
    const response = await fetch(`/api/projects/${projectId}/ai/proposals`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) setError(body.message || "Não foi possível gerar a proposta.");
    else {
      setProposals((current) => [{ ...body.proposal, createdAt: body.proposal.createdAt }, ...current]);
      router.refresh();
    }
    setBusy(false);
  }

  async function decide(id: string, decision: "approve" | "reject") {
    setBusy(true); setError("");
    const response = await fetch(`/api/projects/${projectId}/ai/proposals/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }),
    });
    const body = await response.json();
    if (!response.ok) setError(body.error || "Não foi possível registrar a decisão.");
    else {
      setProposals((current) => current.map((item) => item.id === id ? { ...item, status: decision === "approve" ? "approved" : "rejected" } : item));
      router.refresh();
    }
    setBusy(false);
  }

  return <section className="ai-panel">
    <div className="ai-panel-head">
      <div><span className="eyebrow">AI REVIEW • HUMAN-IN-THE-LOOP</span><h2>Propostas de escopo</h2></div>
      <button className="primary button" disabled={busy} onClick={generate}>{busy ? "Processando..." : "Gerar proposta com IA"}</button>
    </div>
    <p className="ai-note">A IA apenas propõe. Nenhuma alteração de plano, requisito ou tarefa é aplicada antes da sua aprovação explícita.</p>
    {error && <p className="error delivery-error">{error}</p>}
    {proposals.length === 0 ? <div className="ai-empty">Nenhuma proposta gerada ainda.</div> : <div className="ai-proposals">
      {proposals.map((item) => <article className="ai-proposal" key={item.id}>
        <header><div><span className={`proposal-status proposal-${item.status}`}>{item.status}</span><strong>{item.proposal.summary}</strong></div><small>{item.provider} • {item.model} • {item.promptVersion}</small></header>
        <div className="ai-proposal-grid">
          <div><span>Plano</span><p>{item.proposal.plan.summary}</p></div>
          <div><span>Escopo sugerido</span><p>{item.proposal.requirements.length} requisitos • {item.proposal.tasks.length} tarefas</p></div>
        </div>
        <details><summary>Revisar conteúdo proposto</summary>
          <div className="ai-review-body"><h4>Requisitos</h4>{item.proposal.requirements.map((req) => <div className="ai-review-item" key={req.key}><strong>{req.title}</strong><p>{req.description}</p><ul>{req.acceptanceCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></div>)}
          <h4>Tarefas</h4><ul>{item.proposal.tasks.map((task, index) => <li key={`${task.title}-${index}`}>{task.title}</li>)}</ul></div>
        </details>
        {item.status === "pending" && <div className="ai-decision-actions"><button className="secondary button" disabled={busy} onClick={() => decide(item.id, "reject")}>Rejeitar</button><button className="primary button" disabled={busy} onClick={() => decide(item.id, "approve")}>Aprovar e aplicar</button></div>}
      </article>)}
    </div>}
  </section>;
}
