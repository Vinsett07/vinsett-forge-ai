import assert from "node:assert/strict";
import test from "node:test";
import { validateRequirement, validateTask, validateTaskStatus } from "../src/domain/delivery.ts";

test("requirement requires objective acceptance criteria", () => {
  const invalid = validateRequirement({ title: "Login", description: "Usuário precisa entrar", acceptanceCriteria: "" });
  assert.equal(invalid.success, false);

  const valid = validateRequirement({
    title: "Autenticação de usuário",
    description: "Permitir acesso ao workspace apenas para usuários autenticados.",
    acceptanceCriteria: "Credenciais inválidas retornam erro\nSessão válida abre o workspace",
    priority: "must",
  });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.acceptanceCriteria.length, 2);
});

test("task validation accepts optional requirement and bounded text", () => {
  assert.equal(validateTask({ title: "Criar formulário", description: "" }).success, true);
  assert.equal(validateTask({ title: "x", description: "" }).success, false);
});

test("task status accepts only workflow states", () => {
  assert.equal(validateTaskStatus("in_progress"), "in_progress");
  assert.equal(validateTaskStatus("blocked"), null);
});
