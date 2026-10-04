# GitHub Integration — Milestone 5

The Forge GitHub integration is read-only by design.

## Supported context

- repository metadata and default branch;
- issues (pull requests returned by the Issues endpoint are filtered out);
- pull requests;
- recent commits on the default branch;
- recent GitHub Actions workflow runs;
- API rate-limit headers;
- release-readiness checks derived from observable repository state.

## Authentication

Public repositories work without a token. Configure `GITHUB_TOKEN` only on the server to access private repositories or increase the API budget. Never expose this token to client-side code and never store it in the Forge database.

Recommended production evolution: replace the server-wide token with a GitHub App installation flow and least-privilege repository permissions.

## Release readiness rules

The dashboard does not predict whether a release will succeed. It reports factual checks:

- repository accessible / archived;
- age of the latest returned commit;
- open issues carrying known blocker labels;
- open non-draft pull requests;
- latest GitHub Actions conclusion.

A warning is not automatically a release blocker; the project owner decides how to act on it.
