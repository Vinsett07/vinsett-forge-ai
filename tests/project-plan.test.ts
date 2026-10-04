import assert from "node:assert/strict";
import test from "node:test";
import { buildDeterministicPlan, validateProjectBrief } from "../src/domain/project-plan.ts";

const validBrief = {
  name: "Clínica Agenda",
  problem: "Pacientes e recepcionistas perdem tempo coordenando horários manualmente pelo telefone.",
  audience: "Recepcionistas e pacientes de pequenas clínicas",
  outcome: "Agendamentos confirmados com menos retrabalho e visão clara da agenda.",
};

test("rejects vague problem statements", () => {
  const result = validateProjectBrief({ ...validBrief, problem: "Agenda ruim" });
  assert.equal(result.success, false);
});

test("normalizes input and creates a complete deterministic plan", () => {
  const result = validateProjectBrief({ ...validBrief, name: "  Clínica Agenda  " });
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.name, "Clínica Agenda");
  const plan = buildDeterministicPlan(result.data);
  assert.equal(plan.epics.length, 3);
  assert.ok(plan.risks.length >= 3);
  assert.match(plan.definitionOfDone.join(" "), /Agendamentos confirmados/);
});
