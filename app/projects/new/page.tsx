"use client";

import { FormEvent, useState } from "react";
import type { ProjectPlan } from "@/src/domain/project-plan";

export default function NewProjectPage() {
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/projects/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error("Revise os campos do briefing.");
      setPlan(body.plan);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o plano.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell workspace">
      <header className="workspace-header">
        <div>
          <div className="eyebrow">NOVO PROJETO</div>
          <h1>Defina o problema antes da solução.</h1>
          <p>Este briefing será a fonte de verdade do primeiro plano do produto.</p>
        </div>
        <a href="/" className="secondary">Voltar</a>
      </header>

      <div className="workspace-grid">
        <form className="brief-form" onSubmit={submit}>
          <label>Nome do projeto<input name="name" minLength={3} maxLength={80} required placeholder="Ex.: Clínica Agenda" /></label>
          <label>Problema a resolver<textarea name="problem" minLength={20} required placeholder="Descreva o problema real, quem sofre com ele e por quê." /></label>
          <label>Público inicial<textarea name="audience" minLength={3} required placeholder="Quem usará a primeira versão?" /></label>
          <label>Resultado esperado<textarea name="outcome" minLength={10} required placeholder="O que deve ser verdade quando o produto funcionar?" /></label>
          <button className="primary button" disabled={loading}>{loading ? "Estruturando..." : "Gerar plano inicial"}</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>

        <section className="plan-panel" aria-live="polite">
          {!plan ? (
            <div className="empty-state">
              <span>FORGE</span>
              <h2>Seu plano aparecerá aqui.</h2>
              <p>O primeiro milestone usa um planejador determinístico e testável. A camada de IA será conectada sem alterar o contrato do domínio.</p>
            </div>
          ) : (
            <div className="plan-content">
              <div className="eyebrow">PLANO INICIAL</div>
              <h2>{plan.summary}</h2>
              <h3>Épicos</h3>
              {plan.epics.map((epic) => <article className="epic" key={epic.title}><strong>{epic.title}</strong><p>{epic.objective}</p><ul>{epic.stories.map((story) => <li key={story}>{story}</li>)}</ul></article>)}
              <h3>Riscos</h3><ul>{plan.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
              <h3>Definition of Done</h3><ul>{plan.definitionOfDone.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
