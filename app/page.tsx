import Link from "next/link";

const capabilities = [
  ["Briefing estruturado", "Converta uma ideia solta em problema, público, resultado e premissas."],
  ["Planejamento assistido", "Gere épicos, histórias, riscos e critérios de conclusão."],
  ["Rastreabilidade", "Mantenha decisões, requisitos e evolução do projeto no mesmo fluxo."],
];

export default function HomePage() {
  return (
    <main>
      <section className="hero shell">
        <div className="eyebrow">VINSETT • SOFTWARE DELIVERY WORKSPACE</div>
        <h1>Da ideia ao projeto executável, com contexto e disciplina.</h1>
        <p className="lede">
          O Forge AI organiza requisitos, backlog, riscos e critérios de aceite antes que o código vire dívida técnica.
        </p>
        <div className="actions">
          <Link className="primary" href="/auth">Entrar no Forge</Link>
          <a className="secondary" href="#arquitetura">Ver arquitetura do produto</a>
        </div>
        <div className="signal-grid" aria-label="Indicadores do milestone">
          <div><strong>06</strong><span>Milestones construídos</span></div>
          <div><strong>18+</strong><span>Testes automatizados</span></div>
          <div><strong>HITL</strong><span>IA com aprovação humana</span></div>
        </div>
      </section>

      <section className="shell section" id="arquitetura">
        <div className="section-heading">
          <span>Milestone 6</span>
          <h2>Planejamento, execução, IA e contexto de engenharia no mesmo workspace.</h2>
        </div>
        <div className="card-grid">
          {capabilities.map(([title, text]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
