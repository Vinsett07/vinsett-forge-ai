# AI Layer — Milestone 4

## Contract
The AI provider is an adapter, not the domain model. VINSETT Forge owns the `AiWorkspaceProposal` contract and validates every provider response locally before saving it.

## Provider path
When `AI_PROVIDER=openai` and `OPENAI_API_KEY` is configured, Forge calls the OpenAI Responses API with Structured Outputs (`text.format` JSON Schema). `OPENAI_MODEL` selects the model; the default in this release is `gpt-6-astra`.

When no key is configured, Forge uses `deterministic-v1`. This keeps local development and automated tests functional without a paid or external API dependency.

## Human approval boundary
Generation creates an `ai_proposals` row with status `pending`. It does **not** mutate the active project plan, requirements, or tasks.

A human can:
- reject: proposal is closed with an audit event and no scope change;
- approve: one database transaction updates the current plan, creates the next immutable plan snapshot, inserts proposed requirements/tasks, records the decision and writes the audit event.

If any write in the approval transaction fails, all scope changes roll back.

## Audit metadata
Each proposal records:
- prompt version;
- provider;
- model;
- provider response ID when available;
- full structured proposal;
- creator;
- decision status, actor and timestamp.

## Prompt version
Current prompt: `forge-planner-v1`.

Prompt changes must increment the version so historical proposals can be traced to the instructions that produced them.
