---
applyTo: "**"
---

# Commit Message Guidelines

Follow the Conventional Commits specification for all commit messages.

Always ensure messages are clear, concise, and actionable for the team.

- Generate a concise, informative commit message using the Conventional Commit format with a Gitmoji: <gitmoji> <type>(<scope>): <subject>\n\n<body>\n\n<footer>
- Types: feat, fix, docs, style, refactor, perf, test, chore. Use these to indicate the kind of change.
- Scope: Specify the part of the codebase affected (e.g., api, ui, auth). Omit if the change is broad or system-wide.
- Subject: Write a short, imperative mood description of the change (e.g., 'Add feature', not 'Added feature'). Keep it under 50 characters. Do not end with a period. Capitalize the first word.
- Body: Provide more detailed explanatory text, if necessary. Wrap at 72 characters. Explain what and why, not how. Allways use bullets for multiple points.
- Footer: Reference any issue numbers with a # prefix (e.g., Closes #123). For breaking changes, start with BREAKING CHANGE: followed by an explanation.
- Use imperative mood in the subject line (e.g., Add, not Added).
- Add a relevant Gitmoji at the beginning of the commit message to visually represent the commit type.


