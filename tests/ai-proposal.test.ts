import assert from "node:assert/strict";
import test from "node:test";
import {
  AI_PROMPT_VERSION,
  buildDeterministicWorkspaceProposal,
  validateAiWorkspaceProposal,
} from "../src/domain/ai-proposal.ts";
import { generateWorkspaceProposal } from "../src/ai/provider.ts";

const brief = {
  name: "Clínica Agenda",
  problem: "Pacientes e recepcionistas perdem tempo coordenando horários manualmente pelo telefone.",
  audience: "Recepcionistas e pacientes de pequenas clínicas",
  outcome: "Agendamentos confirmados com menos retrabalho e visão clara da agenda.",
};

test("deterministic AI fallback creates a locally valid reviewable proposal", () => {
  const proposal = buildDeterministicWorkspaceProposal(brief);
  const result = validateAiWorkspaceProposal(proposal);
  assert.equal(result.success, true);
  assert.ok(proposal.requirements.length >= 1);
  assert.ok(proposal.tasks.length >= proposal.requirements.length);
  assert.match(AI_PROMPT_VERSION, /^forge-planner-v\d+$/);
});

test("proposal validation rejects tasks linked to unknown requirement keys", () => {
  const proposal = buildDeterministicWorkspaceProposal(brief);
  proposal.tasks[0].requirementKey = "missing-requirement";
  const result = validateAiWorkspaceProposal(proposal);
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.errors.includes("invalid_task"));
});

test("proposal validation rejects duplicate requirement keys", () => {
  const proposal = buildDeterministicWorkspaceProposal(brief);
  proposal.requirements[1].key = proposal.requirements[0].key;
  const result = validateAiWorkspaceProposal(proposal);
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.errors.includes("invalid_requirement"));
});


test("provider adapter uses deterministic fallback when no OpenAI key is configured", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousProvider = process.env.AI_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  process.env.AI_PROVIDER = "disabled";
  try {
    const result = await generateWorkspaceProposal(brief, { existingRequirements: [], existingTasks: [] });
    assert.equal(result.provider, "deterministic");
    assert.equal(result.model, "deterministic-v1");
    assert.equal(validateAiWorkspaceProposal(result.proposal).success, true);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;
    if (previousProvider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = previousProvider;
  }
});

test("external provider supports direct and gateway URLs and validates structured responses", async (t) => {
  const keys = ["OPENAI_API_KEY", "AI_PROVIDER", "OPENAI_BASE_URL", "OPENAI_MODEL"] as const;
  const previous = keys.map((key) => [key, process.env[key]] as const);
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.OPENAI_API_KEY = "test-server-only-key";
  process.env.AI_PROVIDER = "openai";
  process.env.OPENAI_MODEL = "test-model";
  const proposal = buildDeterministicWorkspaceProposal(brief);
  let responseProposal: unknown = proposal;
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    requests.push({ url, init });
    return Response.json({ id: "response-test", output: [
      { type: "message", content: [{ type: "output_text", text: JSON.stringify(responseProposal) }] },
    ] });
  });
  for (const [base, expected] of [
    [undefined, "https://api.openai.com/v1/responses"],
    ["https://gateway.example/openai", "https://gateway.example/openai/v1/responses"],
    ["https://gateway.example/openai/v1/", "https://gateway.example/openai/v1/responses"],
  ]) {
    if (base === undefined) delete process.env.OPENAI_BASE_URL; else process.env.OPENAI_BASE_URL = base;
    const result = await generateWorkspaceProposal(brief, { existingRequirements: [], existingTasks: [] });
    assert.equal(requests.at(-1)?.url, expected);
    assert.equal(result.provider, "openai");
    assert.equal(result.providerResponseId, "response-test");
    assert.deepEqual(result.proposal, proposal);
    const payload = JSON.parse(String(requests.at(-1)?.init?.body));
    assert.equal(payload.store, false);
    assert.equal(payload.text.format.strict, true);
    assert.equal(payload.model, "test-model");
  }
  responseProposal = { ...proposal, tasks: [{ ...proposal.tasks[0], requirementKey: "unknown" }] };
  await assert.rejects(generateWorkspaceProposal(brief, { existingRequirements: [], existingTasks: [] }), /failed local validation/);
});
