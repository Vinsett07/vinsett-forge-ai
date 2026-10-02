export const requirementPriorities = ["must", "should", "could"] as const;
export type RequirementPriority = typeof requirementPriorities[number];

export const taskStatuses = ["backlog", "ready", "in_progress", "review", "done"] as const;
export type TaskStatus = typeof taskStatuses[number];

export type RequirementInput = {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: RequirementPriority;
};

export type TaskInput = {
  title: string;
  description: string;
  requirementId: string | null;
};

export type DeliveryValidation<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRequirement(input: unknown): DeliveryValidation<RequirementInput> {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const rawCriteria = Array.isArray(source.acceptanceCriteria)
    ? source.acceptanceCriteria
    : typeof source.acceptanceCriteria === "string"
      ? source.acceptanceCriteria.split("\n")
      : [];
  const criteria = rawCriteria.map(text).filter(Boolean).slice(0, 20);
  const priority = text(source.priority) as RequirementPriority;
  const data: RequirementInput = {
    title: text(source.title),
    description: text(source.description),
    acceptanceCriteria: criteria,
    priority: requirementPriorities.includes(priority) ? priority : "must",
  };

  const errors: Record<string, string[]> = { title: [], description: [], acceptanceCriteria: [], priority: [] };
  if (data.title.length < 3 || data.title.length > 140) errors.title.push("Use entre 3 e 140 caracteres.");
  if (data.description.length < 10 || data.description.length > 3000) errors.description.push("Use entre 10 e 3000 caracteres.");
  if (data.acceptanceCriteria.length === 0) errors.acceptanceCriteria.push("Informe ao menos um critério de aceite.");
  if (data.acceptanceCriteria.some((item) => item.length > 500)) errors.acceptanceCriteria.push("Cada critério deve ter no máximo 500 caracteres.");

  const success = Object.values(errors).every((items) => items.length === 0);
  return success ? { success: true, data } : { success: false, errors };
}

export function validateTask(input: unknown): DeliveryValidation<TaskInput> {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const requirementId = text(source.requirementId);
  const data: TaskInput = {
    title: text(source.title),
    description: text(source.description),
    requirementId: requirementId || null,
  };
  const errors: Record<string, string[]> = { title: [], description: [], requirementId: [] };
  if (data.title.length < 3 || data.title.length > 160) errors.title.push("Use entre 3 e 160 caracteres.");
  if (data.description.length > 3000) errors.description.push("Use no máximo 3000 caracteres.");
  if (data.requirementId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requirementId)) {
    errors.requirementId.push("Requirement ID inválido.");
  }
  const success = Object.values(errors).every((items) => items.length === 0);
  return success ? { success: true, data } : { success: false, errors };
}

export function validateTaskStatus(value: unknown): TaskStatus | null {
  return typeof value === "string" && taskStatuses.includes(value as TaskStatus)
    ? value as TaskStatus
    : null;
}
