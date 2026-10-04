import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

test("authenticated workspace persists delivery and requires an owner decision for AI scope", async ({ page, browser, request, baseURL }) => {
  test.setTimeout(120_000);
  const suffix = randomUUID();
  const email = `forge-${suffix}@example.test`;
  const password = "Forge-test-password-2026";
  const projectName = `Forge acceptance ${suffix}`;

  expect((await request.get("/api/health")).status()).toBe(200);
  expect((await request.get("/api/projects")).status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth$/);
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Forge Test Owner");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.locator("form").getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Forge Test Owner");

  await page.getByRole("link", { name: "Novo projeto", exact: true }).click();
  await page.getByLabel("Nome do projeto").fill(projectName);
  await page.getByLabel("Problema a resolver").fill("Pessoas precisam organizar projetos e acompanhar suas entregas com segurança.");
  await page.getByLabel("Público inicial").fill("Desenvolvedores independentes");
  await page.getByLabel("Resultado esperado").fill("Entregas rastreáveis com aprovação explícita de escopo.");
  await page.getByRole("button", { name: "Criar projeto e plano" }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]{36}$/);
  const projectId = new URL(page.url()).pathname.split("/").pop()!;
  const projectApi = `/api/projects/${projectId}`;
  await expect(page.getByText("PLANO SALVO • SNAPSHOT V1", { exact: true })).toBeVisible();

  const requirementForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Novo requisito", exact: true }) });
  await requirementForm.getByLabel("Título", { exact: true }).fill("Persistir entregas aprovadas");
  await requirementForm.getByLabel("Descrição").fill("O usuário pode acompanhar o estado das entregas do seu projeto.");
  await requirementForm.getByLabel("Critérios de aceite").fill("Uma tarefa concluída continua concluída após recarregar a página.");
  await requirementForm.getByRole("button", { name: "Adicionar requisito" }).click();
  await expect(page.locator(".requirement-card")).toHaveCount(1);

  const taskForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Nova tarefa", exact: true }) });
  await taskForm.getByLabel("Título", { exact: true }).fill("Validar persistência do Kanban");
  await taskForm.getByLabel("Requisito relacionado").selectOption({ label: "Persistir entregas aprovadas" });
  await taskForm.getByRole("button", { name: "Adicionar tarefa" }).click();
  const taskCard = page.locator(".task-card").filter({ hasText: "Validar persistência do Kanban" });
  await expect(taskCard).toBeVisible();
  await taskCard.getByLabel("Mover para").selectOption("done");
  await expect(taskCard.getByLabel("Mover para")).toHaveValue("done");
  await page.reload();
  await expect(taskCard.getByLabel("Mover para")).toHaveValue("done");

  await page.getByRole("button", { name: "Gerar proposta com IA" }).click();
  await expect(page.locator(".proposal-pending")).toHaveCount(1);
  await expect(page.locator(".requirement-card")).toHaveCount(1);
  await expect(page.locator(".task-card")).toHaveCount(1);
  const proposalResponse = await page.request.get(`${projectApi}/ai/proposals`);
  const { proposals: [pending] } = await proposalResponse.json();
  expect(pending.provider).toBe("deterministic");

  // A different authenticated user cannot read, change, approve or delete this project.
  const outsider = await browser.newContext({ baseURL });
  try {
    const registration = await outsider.request.post("/api/auth/register", { data: {
      displayName: "Other Forge User", email: `other-${suffix}@example.test`, password,
    } });
    expect(registration.status()).toBe(201);
    expect((await outsider.request.get(projectApi)).status()).toBe(404);
    expect((await outsider.request.patch(projectApi, { data: { status: "done" } })).status()).toBe(404);
    expect((await outsider.request.post(`${projectApi}/tasks`, { data: { title: "Unauthorized task", description: "" } })).status()).toBe(404);
    expect((await outsider.request.patch(`${projectApi}/ai/proposals/${pending.id}`, { data: { decision: "approve" } })).status()).toBe(404);
    expect((await outsider.request.delete(projectApi)).status()).toBe(404);
    const list = await outsider.request.get("/api/projects");
    expect((await list.json()).projects).toHaveLength(0);
  } finally { await outsider.close(); }

  await page.getByRole("button", { name: "Aprovar e aplicar" }).click();
  await expect(page.getByText("PLANO SALVO • SNAPSHOT V2", { exact: true })).toBeVisible();
  const requirementsAfterApproval = 1 + pending.proposal.requirements.length;
  const tasksAfterApproval = 1 + pending.proposal.tasks.length;
  await expect(page.locator(".requirement-card")).toHaveCount(requirementsAfterApproval);
  await expect(page.locator(".task-card")).toHaveCount(tasksAfterApproval);
  expect((await page.request.patch(`${projectApi}/ai/proposals/${pending.id}`, { data: { decision: "approve" } })).status()).toBe(409);

  await page.getByRole("button", { name: "Gerar proposta com IA" }).click();
  await expect(page.locator(".proposal-pending")).toHaveCount(1);
  await page.getByRole("button", { name: "Rejeitar", exact: true }).click();
  await expect(page.locator(".proposal-rejected")).toHaveCount(1);
  await expect(page.locator(".requirement-card")).toHaveCount(requirementsAfterApproval);
  await expect(page.locator(".task-card")).toHaveCount(tasksAfterApproval);

  // Two approved proposals allocate distinct snapshot versions under concurrent requests.
  const proposalIds: string[] = [];
  for (let i = 0; i < 2; i++) {
    const result = await page.request.post(`${projectApi}/ai/proposals`);
    expect(result.status()).toBe(201);
    proposalIds.push((await result.json()).proposal.id);
  }
  const decisions = await Promise.all(proposalIds.map((id) => page.request.patch(`${projectApi}/ai/proposals/${id}`, { data: { decision: "approve" } })));
  expect(decisions.map((result) => result.status())).toEqual([200, 200]);
  const versions = await Promise.all(decisions.map(async (result) => (await result.json()).snapshotVersion));
  expect(versions.sort()).toEqual([3, 4]);
  await page.reload();
  await expect(page.getByText("PLANO SALVO • SNAPSHOT V4", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Workspace", exact: true }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  expect((await page.request.get(projectApi)).status()).toBe(401);
  await page.goto("/auth");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.locator("form").getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link").filter({ has: page.getByRole("heading", { name: projectName, exact: true }) }).click();
  await expect(taskCard.getByLabel("Mover para")).toHaveValue("done");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir projeto" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect((await page.request.get(projectApi)).status()).toBe(404);
  expect((await page.request.get(`${projectApi}/ai/proposals`)).status()).toBe(404);
});
