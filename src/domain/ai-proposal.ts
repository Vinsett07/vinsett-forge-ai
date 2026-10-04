import type { ProjectBrief, ProjectPlan } from "./project-plan.ts";
import { buildDeterministicPlan } from "./project-plan.ts";

export const AI_PROMPT_VERSION = "forge-planner-v1";
export const AI_PROPOSAL_KINDS = ["workspace_bootstrap"] as const;
export const AI_PROPOSAL_STATUSES = ["pending", "approved", "rejected"] as const;

export type AiProposalKind = typeof AI_PROPOSAL_KINDS[number];
export type AiProposalStatus = typeof AI_PROPOSAL_STATUSES[number];
export type ProposalPriority = "must" | "should" | "could";

export type ProposedRequirement = {
  key: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: ProposalPriority;
};

export type ProposedTask = {
  title: string;
  description: string;
  requirementKey: string | null;
};

export type AiWorkspaceProposal = {
  summary: string;
  plan: ProjectPlan;
  requirements: ProposedRequirement[];
  tasks: ProposedTask[];
};

export type AiProposalValidation =
  | { success: true; data: AiWorkspaceProposal }
  | { success: false; errors: string[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown, min = 1, max = 2000): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
}

function stringArray(value: unknown, minItems = 1, maxItems = 20): string[] | null {
  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) return null;
  const normalized = value.map((item) => nonEmptyString(item, 1, 600));
  return normalized.every(Boolean) ? normalized as string[] : null;
}

function validatePlan(value: unknown): ProjectPlan | null {
  if (!isObject(value)) return null;
  const summary = nonEmptyString(value.summary, 10, 2000);
  const assumptions = stringArray(value.assumptions, 1, 12);
  const risks = stringArray(value.risks, 1, 12);
  const definitionOfDone = stringArray(value.definitionOfDone, 1, 16);
  if (!summary || !assumptions || !risks || !definitionOfDone || !Array.isArray(value.epics) || value.epics.length < 1 || value.epics.length > 8) return null;

  const epics = value.epics.map((item) => {
    if (!isObject(item)) return null;
    const title = nonEmptyString(item.title, 3, 160);
    const objective = nonEmptyString(item.objective, 10, 700);
    const stories = stringArray(item.stories, 1, 10);
    return title && objective && stories ? { title, objective, stories } : null;
  });
  if (!epics.every(Boolean)) return null;
  return { summary, assumptions, epics: epics as ProjectPlan["epics"], risks, definitionOfDone };
}

export function validateAiWorkspaceProposal(value: unknown): AiProposalValidation {
  if (!isObject(value)) return { success: false, errors: ["proposal_not_object"] };
  const errors: string[] = [];
  const summary = nonEmptyString(value.summary, 10, 2000);
  const plan = validatePlan(value.plan);
  if (!summary) errors.push("invalid_summary");
  if (!plan) errors.push("invalid_plan");

  const requirementsInput = Array.isArray(value.requirements) ? value.requirements : [];
  const requirements: ProposedRequirement[] = [];
  const keys = new Set<string>();
  if (requirementsInput.length < 1 || requirementsInput.length > 20) errors.push("invalid_requirements_count");
  for (const item of requirementsInput) {
    if (!isObject(item)) { errors.push("invalid_requirement"); continue; }
    const key = nonEmptyString(item.key, 2, 80);
    const title = nonEmptyString(item.title, 3, 160);
    const description = nonEmptyString(item.description, 10, 1200);
    const acceptanceCriteria = stringArray(item.acceptanceCriteria, 1, 10);
    const priority = item.priority;
    if (!key || !title || !description || !acceptanceCriteria || !["must", "should", "could"].includes(String(priority)) || keys.has(key)) {
      errors.push("invalid_requirement");
      continue;
    }
    keys.add(key);
    requirements.push({ key, title, description, acceptanceCriteria, priority: priority as ProposalPriority });
  }

  const tasksInput = Array.isArray(value.tasks) ? value.tasks : [];
  const tasks: ProposedTask[] = [];
  if (tasksInput.length < 1 || tasksInput.length > 40) errors.push("invalid_tasks_count");
  for (const item of tasksInput) {
    if (!isObject(item)) { errors.push("invalid_task"); continue; }
    const title = nonEmptyString(item.title, 3, 180);
    const description = nonEmptyString(item.description, 0, 1200) ?? "";
    const requirementKey = item.requirementKey === null ? null : nonEmptyString(item.requirementKey, 2, 80);
    if (!title || (item.requirementKey !== null && (!requirementKey || !keys.has(requirementKey)))) {
      errors.push("invalid_task");
      continue;
    }
    tasks.push({ title, description, requirementKey });
  }

  return errors.length || !summary || !plan
    ? { success: false, errors: [...new Set(errors)] }
    : { success: true, data: { summary, plan, requirements, tasks } };
}

export function buildDeterministicWorkspaceProposal(brief: ProjectBrief): AiWorkspaceProposal {
  const plan = buildDeterministicPlan(brief);
  const requirements: ProposedRequirement[] = plan.epics.map((epic, index) => ({
    key: `req-${index + 1}`,
    title: epic.title,
    description: epic.objective,
    acceptanceCriteria: [
      `O objetivo "${epic.objective}" possui evidência verificável de conclusão.`,
      "O fluxo principal relacionado pode ser demonstrado sem etapas manuais ocultas.",
    ],
    priority: index === 0 ? "must" : index === 1 ? "should" : "could",
  }));
  const tasks: ProposedTask[] = plan.epics.flatMap((epic, index) => epic.stories.map((story) => ({
    title: story.replace(/^Como [^,]+,\s*/i, "").replace(/\.$/, ""),
    description: `Implementar e validar a história: ${story}`,
    requirementKey: `req-${index + 1}`,
  })));
  return {
    summary: `Proposta inicial para transformar o briefing de ${brief.name} em escopo executável. Revise antes de aprovar.`,
    plan,
    requirements,
    tasks,
  };
}

export const AI_WORKSPACE_PROPOSAL_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    plan: {
      type: "object", additionalProperties: false,
      properties: {
        summary: { type: "string" },
        assumptions: { type: "array", items: { type: "string" } },
        epics: { type: "array", items: {
          type: "object", additionalProperties: false,
          properties: { title: { type: "string" }, objective: { type: "string" }, stories: { type: "array", items: { type: "string" } } },
          required: ["title", "objective", "stories"],
        } },
        risks: { type: "array", items: { type: "string" } },
        definitionOfDone: { type: "array", items: { type: "string" } },
      },
      required: ["summary", "assumptions", "epics", "risks", "definitionOfDone"],
    },
    requirements: { type: "array", items: {
      type: "object", additionalProperties: false,
      properties: {
        key: { type: "string" }, title: { type: "string" }, description: { type: "string" },
        acceptanceCriteria: { type: "array", items: { type: "string" } },
        priority: { type: "string", enum: ["must", "should", "could"] },
      }, required: ["key", "title", "description", "acceptanceCriteria", "priority"],
    } },
    tasks: { type: "array", items: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" }, description: { type: "string" },
        requirementKey: { type: ["string", "null"] },
      }, required: ["title", "description", "requirementKey"],
    } },
  },
  required: ["summary", "plan", "requirements", "tasks"],
} as const;
