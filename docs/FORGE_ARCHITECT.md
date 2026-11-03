# Forge Architect — implementation blueprint

## Current status

StudyForge has an interactive demo but **does not yet have** production authentication, saved conversations, an AI backend, or a controlled coding-agent runtime. Forge Architect must not be represented as operational until those integrations work.

## Student platform first (prerequisites)
1. Set up Supabase Auth (email/Google) and protected routes.
2. Student onboarding and course creation.
3. Private note uploads and provenance-aware parsing.
4. Streaming tutor API with server-held API key, model configuration and spend caps.
5. Structured lessons, prerequisite checks and explain/hint flows.
6. Quiz generator, answer validation and grading.
7. Active recall, flashcards and progress tracking.
8. Safe, prebuilt interactive visualization components.

## Developer Studio architecture

**Authorization:** Only a verified Supabase user whose UUID appears in a private, server-side allowlist can access any Forge Architect capability. Never accept role, email or GitHub username assertions from the browser. All developer APIs must fail closed when identity or configuration is missing. Use RLS for persisted owner-only records and server-side checks on every API route.

**Development agent:** The backend plans work; repository reads use a scoped GitHub App token. Generated changes are made in an isolated short-lived runner with no production credentials, limited CPU, memory, time and network access. Push only a new branch and open a pull request. Never push to main from the agent. Do not merge or deploy automatically.

**Human review:** Record plan, changed files, diff, tests and security checks. Require explicit owner approval and required passing CI checks for PR merges. Owner may request changes or reject a proposal.

**Memory:** Store approved project decisions, architecture, prior bugs, accepted/rejected PRs and test outcomes in separate development tables, with provenance and timestamps. Do not fine-tune an underlying model or ingest private student material by default.

**Suggestions:** Accept opted-in anonymized issue reports only; avoid inferring sensitive details from student sessions. Every suggested improvement remains a proposal until reviewed.

**Cost controls:** Per-task spending budgets, per-owner rate limits and audit logs. Stop tasks when budget or time limits are reached.

## Data model (planned)
- development_requests: id, created_by, description, status, created_at
- development_plans: id, request_id, summary, risk_level, created_at
- development_runs: id, plan_id, runner_id, status, started_at, finished_at, cost_estimate
- development_artifacts: id, run_id, branch, pr_url, diff_summary, test_report
- development_decisions: id, run_id, reviewed_by, decision, notes, decided_at
- development_knowledge: id, category, statement, source, reviewed_at
- development_audit_log: id, actor_id, action, metadata, created_at

All tables require explicit RLS policies. Avoid logging API keys, raw notes or student chat text.

## Definition of done
A request must produce a *real* GitHub pull request with inspectable diffs and tests. An admin UI alone is **not** a working Builder AI.

## Deployment safety
The production deployment should come from reviewed main-branch commits only. Changes in this feature branch are intentionally not live before review.
