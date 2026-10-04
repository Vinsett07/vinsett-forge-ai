import type { ProjectBrief } from "../domain/project-plan.ts";
import {
  AI_PROMPT_VERSION,
  AI_WORKSPACE_PROPOSAL_JSON_SCHEMA,
  buildDeterministicWorkspaceProposal,
  validateAiWorkspaceProposal,
  type AiWorkspaceProposal,
} from "../domain/ai-proposal.ts";
import { PLANNER_INSTRUCTIONS } from "./prompts.ts";

export type PlannerContext = {
  existingRequirements: Array<{ title: string; description: string; priority: string }>;
  existingTasks: Array<{ title: string; status: string }>;
};

export type PlannerResult = {
  provider: "openai" | "deterministic";
  model: string;
  promptVersion: string;
  providerResponseId: string | null;
  proposal: AiWorkspaceProposal;
};

type OpenAIResponse = {
  id?: string;
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  status?: string;
  error?: { message?: string } | null;
};

function extractOutputText(response: OpenAIResponse): string | null {
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return null;
}

export async function generateWorkspaceProposal(brief: ProjectBrief, context: PlannerContext): Promise<PlannerResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const configuredProvider = process.env.AI_PROVIDER?.trim().toLowerCase() || (apiKey ? "openai" : "disabled");
  if (configuredProvider !== "openai" || !apiKey) {
    return {
      provider: "deterministic",
      model: "deterministic-v1",
      promptVersion: AI_PROMPT_VERSION,
      providerResponseId: null,
      proposal: buildDeterministicWorkspaceProposal(brief),
    };
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-6-astra";
  // Netlify AI Gateway injects a base URL and a server-only API key.
  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
  const responsesUrl = `${baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`}/responses`;
  const response = await fetch(responsesUrl, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      instructions: PLANNER_INSTRUCTIONS,
      input: JSON.stringify({ brief, currentWorkspace: context }),
      text: {
        format: {
          type: "json_schema",
          name: "vinsett_forge_workspace_proposal",
          strict: true,
          schema: AI_WORKSPACE_PROPOSAL_JSON_SCHEMA,
        },
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const body = await response.json().catch(() => null) as OpenAIResponse | null;
  if (!response.ok || !body) {
    const message = body?.error?.message || `OpenAI request failed with status ${response.status}`;
    throw new Error(message);
  }
  const outputText = extractOutputText(body);
  if (!outputText) throw new Error("OpenAI response did not contain structured output text.");
  let parsed: unknown;
  try { parsed = JSON.parse(outputText); } catch { throw new Error("OpenAI structured output was not valid JSON."); }
  const validated = validateAiWorkspaceProposal(parsed);
  if (!validated.success) throw new Error(`OpenAI proposal failed local validation: ${validated.errors.join(", ")}`);

  return {
    provider: "openai",
    model,
    promptVersion: AI_PROMPT_VERSION,
    providerResponseId: body.id ?? null,
    proposal: validated.data,
  };
}
