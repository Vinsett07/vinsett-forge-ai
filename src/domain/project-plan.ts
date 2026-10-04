export type ProjectBrief = {
  name: string;
  problem: string;
  audience: string;
  outcome: string;
};

export type ProjectBriefValidation =
  | { success: true; data: ProjectBrief }
  | { success: false; errors: Record<keyof ProjectBrief, string[]> };

export type ProjectPlan = {
  summary: string;
  assumptions: string[];
  epics: Array<{
    title: string;
    objective: string;
    stories: string[];
  }>;
  risks: string[];
  definitionOfDone: string[];
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateProjectBrief(input: unknown): ProjectBriefValidation {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const data: ProjectBrief = {
    name: text(source.name),
    problem: text(source.problem),
    audience: text(source.audience),
    outcome: text(source.outcome),
  };

  const errors: Record<keyof ProjectBrief, string[]> = {
    name: [], problem: [], audience: [], outcome: [],
  };

  if (data.name.length < 3 || data.name.length > 80) errors.name.push("Use entre 3 e 80 caracteres.");
  if (data.problem.length < 20 || data.problem.length > 2000) errors.problem.push("Descreva o problema em 20 a 2000 caracteres.");
  if (data.audience.length < 3 || data.audience.length > 500) errors.audience.push("Descreva o público em 3 a 500 caracteres.");
  if (data.outcome.length < 10 || data.outcome.length > 1000) errors.outcome.push("Descreva o resultado em 10 a 1000 caracteres.");

  const success = Object.values(errors).every((items) => items.length === 0);
  return success ? { success: true, data } : { success: false, errors };
}

export function buildDeterministicPlan(brief: ProjectBrief): ProjectPlan {
  const productName = brief.name.trim();
  return {
    summary: `${productName} será estruturado para resolver: ${brief.problem.trim()}`,
    assumptions: [
      `O público inicial é ${brief.audience.trim()}.`,
      "A primeira versão deve priorizar um fluxo principal completo antes de funcionalidades periféricas.",
      "Decisões críticas precisam ser registradas e testáveis.",
    ],
    epics: [
      {
        title: "Descoberta e requisitos",
        objective: "Transformar o problema em requisitos verificáveis e critérios de aceite.",
        stories: [
          "Como responsável pelo produto, quero registrar o problema e o resultado esperado.",
          "Como equipe, quero visualizar requisitos, premissas e riscos em um só lugar.",
        ],
      },
      {
        title: "Planejamento de entrega",
        objective: "Converter requisitos em trabalho executável e priorizado.",
        stories: [
          "Como equipe, quero decompor o escopo em épicos e histórias.",
          "Como responsável, quero saber o que precisa estar pronto para considerar a entrega concluída.",
        ],
      },
      {
        title: "Acompanhamento",
        objective: "Dar visibilidade ao andamento, bloqueios e decisões do projeto.",
        stories: [
          "Como equipe, quero acompanhar estados de trabalho sem perder o histórico.",
          "Como responsável, quero identificar riscos e pendências rapidamente.",
        ],
      },
    ],
    risks: [
      "Escopo crescer antes da validação do fluxo principal.",
      "Critérios de aceite vagos produzirem entregas difíceis de validar.",
      "Dependências externas bloquearem a evolução do produto.",
    ],
    definitionOfDone: [
      `O fluxo principal entrega o resultado: ${brief.outcome.trim()}`,
      "Requisitos críticos têm critérios de aceite objetivos.",
      "Testes automatizados cobrem regras de domínio essenciais.",
      "Documentação descreve execução local, arquitetura e limitações conhecidas.",
    ],
  };
}
