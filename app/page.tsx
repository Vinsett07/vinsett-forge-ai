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
          <Link className="primary" href="/projects/new">Criar primeiro projeto</Link>
          <a className="secondary" href="#arquitetura">Ver arquitetura do produto</a>
        </div>
        <div className="signal-grid" aria-label="Indicadores do milestone">
          <div><strong>01</strong><span>Briefing validado</span></div>
          <div><strong>04</strong><span>Artefatos de planejamento</span></div>
          <div><strong>100%</strong><span>Regras de domínio testáveis</span></div>
        </div>
      </section>

      <section className="shell section" id="arquitetura">
        <div className="section-heading">
          <span>Milestone 1</span>
          <h2>Fundação antes de automação.</h2>
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
