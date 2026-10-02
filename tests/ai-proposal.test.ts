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
