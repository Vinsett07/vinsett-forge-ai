import Link from "next/link";
import { requireSession } from "@/src/auth/session";
import { listProjects } from "@/src/repositories/projects";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const session = await requireSession();
  const projects = await listProjects(session.userId);

  return (
    <main className="shell workspace dashboard">
      <header className="workspace-header dashboard-header">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1>Olá, {session.displayName}.</h1>
          <p>{projects.length === 0 ? "Seu workspace está pronto para o primeiro projeto." : `${projects.length} projeto${projects.length === 1 ? "" : "s"} no seu workspace.`}</p>
        </div>
        <div className="actions compact-actions">
          <Link className="primary" href="/projects/new">Novo projeto</Link>
          <LogoutButton />
        </div>
      </header>

      {projects.length === 0 ? (
        <section className="empty-dashboard">
          <span className="eyebrow">COMECE PELO PROBLEMA</span>
          <h2>Transforme uma ideia em um plano rastreável.</h2>
          <p>O Forge cria o briefing, gera o primeiro plano e salva um snapshot versionado para que a evolução tenha histórico.</p>
          <Link className="primary" href="/projects/new">Criar primeiro projeto</Link>
        </section>
      ) : (
        <section className="project-list" aria-label="Projetos">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} className="project-row" key={project.id}>
              <div>
                <span className={`status status-${project.status}`}>{project.status}</span>
                <h2>{project.name}</h2>
                <p>{project.outcome}</p>
              </div>
              <div className="project-meta">
                <span>Atualizado</span>
                <strong>{project.updatedAt.toLocaleDateString("pt-BR")}</strong>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
