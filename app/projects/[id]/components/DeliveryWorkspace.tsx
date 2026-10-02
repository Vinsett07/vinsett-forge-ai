"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RequirementPriority, TaskStatus } from "@/src/domain/delivery";

type Requirement = {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: RequirementPriority;
};

type Task = {
  id: string;
  requirementId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
};

type Activity = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: "backlog", label: "Backlog" },
  { status: "ready", label: "Ready" },
  { status: "in_progress", label: "Em andamento" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

const activityLabels: Record<string, string> = {
  "project.created": "Projeto criado",
  "project.status_changed": "Status do projeto alterado",
  "requirement.created": "Requisito criado",
  "task.created": "Tarefa criada",
  "task.status_changed": "Tarefa movida",
  "ai.proposal_created": "Proposta de IA criada",
  "ai.proposal_approved": "Proposta de IA aprovada",
  "ai.proposal_rejected": "Proposta de IA rejeitada",
};

export function DeliveryWorkspace({
  projectId,
  requirements: initialRequirements,
  tasks: initialTasks,
  activity,
}: {
  projectId: string;
  requirements: Requirement[];
  tasks: Task[];
  activity: Activity[];
}) {
  const router = useRouter();
  const [requirements, setRequirements] = useState(initialRequirements);
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setRequirements(initialRequirements), [initialRequirements]);
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const requirementsById = useMemo(() => new Map(requirements.map((item) => [item.id, item])), [requirements]);

  async function addRequirement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setBusy(true);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(`/api/projects/${projectId}/requirements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (response.ok) {
      setRequirements((current) => [...current, body.requirement]);
      form.reset();
      router.refresh();
    } else setError("Não foi possível criar o requisito. Revise os campos.");
    setBusy(false);
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setBusy(true);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (response.ok) {
      setTasks((current) => [...current, body.task]);
      form.reset();
      router.refresh();
    } else setError("Não foi possível criar a tarefa.");
    setBusy(false);
  }

  async function moveTask(taskId: string, status: TaskStatus) {
    const previous = tasks;
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
    const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setTasks(previous);
      setError("Não foi possível mover a tarefa.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="delivery-workspace">
      <div className="delivery-heading">
        <div><span className="eyebrow">DELIVERY WORKSPACE</span><h2>Requisitos e execução</h2></div>
        <p>Critérios de aceite definem o que precisa ser verdade; tarefas mostram como a equipe pretende chegar lá.</p>
      </div>

      {error && <p className="error delivery-error" role="alert">{error}</p>}

      <div className="delivery-forms">
        <form className="mini-form" onSubmit={addRequirement}>
          <h3>Novo requisito</h3>
          <label>Título<input name="title" required minLength={3} maxLength={140} placeholder="Ex.: Usuário autenticado acessa o workspace" /></label>
          <label>Descrição<textarea name="description" required minLength={10} placeholder="Comportamento esperado e motivo." /></label>
          <label>Critérios de aceite<textarea name="acceptanceCriteria" required placeholder={"Um critério por linha\nEx.: Sessão inválida redireciona para login"} /></label>
          <label>Prioridade<select name="priority" defaultValue="must"><option value="must">Must</option><option value="should">Should</option><option value="could">Could</option></select></label>
          <button className="secondary button" disabled={busy}>Adicionar requisito</button>
        </form>

        <form className="mini-form" onSubmit={addTask}>
          <h3>Nova tarefa</h3>
          <label>Título<input name="title" required minLength={3} maxLength={160} placeholder="Ex.: Implementar endpoint de sessão" /></label>
          <label>Descrição<textarea name="description" placeholder="Detalhes técnicos opcionais." /></label>
          <label>Requisito relacionado<select name="requirementId" defaultValue=""><option value="">Sem vínculo</option>{requirements.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
          <button className="secondary button" disabled={busy}>Adicionar tarefa</button>
        </form>
      </div>

      <div className="requirements-section">
        <div className="subheading"><h3>Requisitos</h3><span>{requirements.length}</span></div>
        {requirements.length === 0 ? <p className="muted">Nenhum requisito criado ainda.</p> : (
          <div className="requirement-grid">
            {requirements.map((item) => (
              <article className="requirement-card" key={item.id}>
                <div className="requirement-top"><span className={`priority priority-${item.priority}`}>{item.priority}</span><strong>{item.title}</strong></div>
                <p>{item.description}</p>
                <ul>{item.acceptanceCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="kanban-section">
        <div className="subheading"><h3>Kanban</h3><span>{tasks.length}</span></div>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);
            return (
              <section className="kanban-column" key={column.status}>
                <header><strong>{column.label}</strong><span>{columnTasks.length}</span></header>
                <div className="kanban-stack">
                  {columnTasks.map((task) => (
                    <article className="task-card" key={task.id}>
                      <strong>{task.title}</strong>
                      {task.description && <p>{task.description}</p>}
                      {task.requirementId && <small>{requirementsById.get(task.requirementId)?.title ?? "Requisito"}</small>}
                      <label className="move-task">Mover para<select value={task.status} onChange={(event) => void moveTask(task.id, event.target.value as TaskStatus)}>{columns.map((target) => <option value={target.status} key={target.status}>{target.label}</option>)}</select></label>
                    </article>
                  ))}
                  {columnTasks.length === 0 && <div className="column-empty">Sem tarefas</div>}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="activity-section">
        <div className="subheading"><h3>Atividade recente</h3><span>{activity.length}</span></div>
        {activity.length === 0 ? <p className="muted">As mudanças do projeto aparecerão aqui.</p> : (
          <ol className="activity-list">
            {activity.map((event) => (
              <li key={event.id}>
                <div><strong>{activityLabels[event.type] ?? event.type}</strong><span>{String(event.payload.title ?? "")}</span></div>
                <time>{new Date(event.createdAt).toLocaleString("pt-BR")}</time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
