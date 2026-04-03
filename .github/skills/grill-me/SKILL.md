---
name: grill-me
description: "Interview the user relentlessly about a plan or design until reaching shared understanding. Use when: stress-test a plan, design review, grill me, poke holes, challenge assumptions, walk the decision tree, resolve design trade-offs."
argument-hint: "Describe the plan or design you want to stress-test"
---

# Grill Me — Design Interview

Conduct a rigorous, structured interview about a plan or design.
Walk down every branch of the decision tree, resolving dependencies
between decisions one by one, until reaching shared understanding.

## When to Use

- The user has a plan, RFC, design doc, or architecture proposal.
- The user wants assumptions challenged before implementation.
- The user says "grill me", "poke holes", or "stress-test this".

## Procedure

### 1. Understand the Plan

- Read the plan the user provides (file, message, or selection).
- If the plan references existing code, explore the codebase to build
  context. Use subagents for large explorations.
- Summarize your understanding back in 3-5 bullet points and ask
  the user to confirm or correct.

### 2. Map the Decision Tree

Identify every decision point in the plan. Group them into branches:

- **Data model**: schemas, relationships, migrations
- **API surface**: endpoints, contracts, error handling
- **State & sync**: client state, caching, real-time, offline
- **Security**: auth, authz, input validation, secrets
- **UX**: flows, edge cases, error states, accessibility
- **Operations**: deployment, rollback, monitoring, migration path
- **Dependencies**: libraries, services, infrastructure

List the branches explicitly so the user sees the full scope.

### 3. Walk Each Branch

For each branch, depth-first:

1. **Ask one focused question** about the most critical or ambiguous
   decision in that branch.
2. **Provide your recommended answer** with brief rationale.
3. If a question can be answered by exploring the codebase, explore
   it yourself and present findings instead of asking.
4. Wait for the user's response before moving on.
5. If the answer reveals a new sub-decision, drill into it immediately
   before continuing to the next branch.
6. When a branch is fully resolved, summarize the decisions made and
   move to the next branch.

### 4. Resolve Cross-Branch Dependencies

After walking all branches, identify conflicts or dependencies
between decisions made in different branches. For example:

- A data model choice that conflicts with the caching strategy.
- An API design that doesn't support the offline-first requirement.
- A security constraint that affects the UX flow.

Raise each conflict as a question with a recommended resolution.

### 5. Converge

When all branches and cross-dependencies are resolved:

1. Present a **decision summary** — a compact list of every resolved
   decision, grouped by branch.
2. Highlight any **open items** that need further investigation or
   are blocked on external factors.
3. Ask the user to confirm the summary or reopen any decision.

## Question Style

- One question at a time. Never dump a list of 10 questions.
- Be direct and specific: "How will you handle X when Y happens?"
  not "Have you thought about error handling?"
- Challenge weak answers: "That works for the happy path, but what
  about [edge case]?"
- Acknowledge strong answers briefly and move on.
- If the user says "you decide" or defers, commit to your
  recommendation and move forward.

## Completion Criteria

The interview is complete when:

- [ ] Every identified branch has been walked.
- [ ] Cross-branch dependencies have been resolved.
- [ ] The user has confirmed the decision summary.
- [ ] Open items (if any) are explicitly listed.
