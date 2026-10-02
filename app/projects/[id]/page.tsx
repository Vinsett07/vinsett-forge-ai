import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/src/auth/session";
import { getDeliveryWorkspace } from "@/src/repositories/delivery";
import { listAiProposals } from "@/src/repositories/ai-proposals";
import type { ProjectPlan } from "@/src/domain/project-plan";
import { ProjectActions } from "./ProjectActions";
import { DeliveryWorkspace } from "./components/DeliveryWorkspace";
import { AIProposalPanel } from "./components/AIProposalPanel";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const workspace = await getDeliveryWorkspace(session.userId, id);
  if (!workspace) notFound();
  const { project } = workspace;
  const plan = project.plan as ProjectPlan | null;
  const aiProposals = await listAiProposals(session.userId, id) ?? [];

  return (
    <main className="shell workspace project-detail">
      <header className="workspace-header detail-header">
        <div>
          <div className="eyebrow">PROJETO • {project.status.toUpperCase()}</div>
          <h1>{project.name}</h1>
          <p>{project.outcome}</p>
        </div>
        <div className="actions compact-actions">
          <Link href="/dashboard" className="secondary">Workspace</Link>
          <ProjectActions id={project.id} currentStatus={project.status} />
        </div>
      </header>

      <section className="detail-grid">
        <aside className="context-panel">
          <span className="eyebrow">FONTE DE VERDADE</span>
          <h2>Briefing</h2>
          <dl>
            <dt>Problema</dt><dd>{project.problem}</dd>
            <dt>Público</dt><dd>{project.audience}</dd>
            <dt>Resultado</dt><dd>{project.outcome}</dd>
          </dl>
        </aside>

        <section className="plan-panel detail-plan">
          {plan ? (
            <div className="plan-content">
              <div className="eyebrow">PLANO SALVO • SNAPSHOT V{workspace.planVersion}</div>
              <h2>{plan.summary}</h2>
              <h3>Premissas</h3><ul>{plan.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
              <h3>Épicos</h3>
              {plan.epics.map((epic) => <article className="epic" key={epic.title}><strong>{epic.title}</strong><p>{epic.objective}</p><ul>{epic.stories.map((story) => <li key={story}>{story}</li>)}</ul></article>)}
              <h3>Riscos</h3><ul>{plan.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
              <h3>Definition of Done</h3><ul>{plan.definitionOfDone.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ) : <p>Nenhum plano salvo.</p>}
        </section>
      </section>

      <AIProposalPanel
        projectId={project.id}
        proposals={aiProposals.map((item) => ({
          id: item.id,
          status: item.status,
          provider: item.provider,
          model: item.model,
          promptVersion: item.promptVersion,
          proposal: item.proposal,
          createdAt: item.createdAt.toISOString(),
        }))}
      />

      <DeliveryWorkspace
        projectId={project.id}
        requirements={workspace.requirements.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          acceptanceCriteria: item.acceptanceCriteria,
          priority: item.priority,
        }))}
        tasks={workspace.tasks.map((item) => ({
          id: item.id,
          requirementId: item.requirementId,
          title: item.title,
          description: item.description,
          status: item.status,
        }))}
        activity={workspace.activity.map((item) => ({
          id: item.id,
          type: item.type,
          payload: item.payload,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
