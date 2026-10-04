"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusLabels = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  done: "Concluído",
};

export function ProjectActions({ id, currentStatus }: { id: string; currentStatus: keyof typeof statusLabels }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: keyof typeof statusLabels) {
    setBusy(true);
    const response = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (response.ok) {
      setStatus(next);
      router.refresh();
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm("Excluir este projeto e seu histórico de planos?")) return;
    setBusy(true);
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.replace("/dashboard");
      router.refresh();
    }
    else setBusy(false);
  }

  return (
    <div className="project-actions">
      <label className="status-control">Status
        <select value={status} disabled={busy} onChange={(event) => void changeStatus(event.target.value as keyof typeof statusLabels)}>
          {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>
      <button className="danger button" disabled={busy} type="button" onClick={remove}>Excluir projeto</button>
    </div>
  );
}
