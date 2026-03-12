---
applyTo: "**"
description: "Conventional Commits format for all commit messages"
---

# Commit Message Guidelines

Follow the Conventional Commits specification for all commit messages.

Always ensure messages are clear, concise, and actionable for the team.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Optionally, add a relevant Gitmoji at the beginning: `<gitmoji> <type>(<scope>): <subject>`

## Rules

- **Types**: feat, fix, docs, style, refactor, perf, test, chore. Use these to indicate the kind of change.
- **Scope**: Specify the part of the codebase affected (e.g., api, ui, auth). Omit if the change is broad or system-wide.
- **Subject**: Write a short, imperative mood description (e.g., "Add feature", not "Added feature"). Keep it under 50 characters. Do not end with a period. Capitalize the first word.
- **Body**: Provide more detailed explanatory text, if necessary. Wrap at 72 characters. Explain what and why, not how. Use bullets for multiple points.
- **Footer**: Reference any issue numbers with a # prefix (e.g., Closes #123). For breaking changes, start with BREAKING CHANGE: followed by an explanation.

## Examples

```
feat(auth): add password reset functionality

- Add password reset request form
- Add password reset confirmation page
- Send email with reset token

Closes #42
```

```
fix(api): handle null user in session middleware
```


