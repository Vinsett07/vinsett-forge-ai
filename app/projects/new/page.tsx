"use client";

import { FormEvent, useState } from "react";

export default function NewProjectPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }
      if (!response.ok) throw new Error("Revise os campos do briefing.");
      window.location.href = `/projects/${body.project.id}`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar o projeto.");
      setLoading(false);
    }
  }

  return (
    <main className="shell workspace new-project-shell">
      <header className="workspace-header">
        <div>
          <div className="eyebrow">NOVO PROJETO</div>
          <h1>Defina o problema antes da solução.</h1>
          <p>Ao salvar, o Forge cria o projeto e registra o primeiro snapshot do plano.</p>
        </div>
        <a href="/dashboard" className="secondary">Workspace</a>
      </header>

      <div className="workspace-grid new-project-grid">
        <form className="brief-form" onSubmit={submit}>
          <label>Nome do projeto<input name="name" minLength={3} maxLength={80} required placeholder="Ex.: Clínica Agenda" /></label>
          <label>Problema a resolver<textarea name="problem" minLength={20} required placeholder="Descreva o problema real, quem sofre com ele e por quê." /></label>
          <label>Público inicial<textarea name="audience" minLength={3} required placeholder="Quem usará a primeira versão?" /></label>
          <label>Resultado esperado<textarea name="outcome" minLength={10} required placeholder="O que deve ser verdade quando o produto funcionar?" /></label>
          <button className="primary button" disabled={loading}>{loading ? "Criando projeto..." : "Criar projeto e plano"}</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>

        <section className="plan-panel creation-explainer">
          <div className="empty-state">
            <span>MILESTONE 2</span>
            <h2>Agora o plano deixa de ser temporário.</h2>
            <p>O briefing será persistido no PostgreSQL, associado ao usuário autenticado e acompanhado de um snapshot versionado do plano inicial.</p>
            <ul className="feature-list">
              <li>Propriedade por usuário</li>
              <li>Persistência PostgreSQL</li>
              <li>Snapshot V1 do planejamento</li>
              <li>Status de projeto editável</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
