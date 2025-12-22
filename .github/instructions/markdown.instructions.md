---
description: "Documentation and content creation standards for the course platform"
applyTo: "**/*.md"
---

# Markdown Documentation Standards

Guidelines for writing consistent, readable documentation across the course platform.

## Document Structure

### Headings
- Use `#` (H1) only once per document for the main title.
- Use `##` (H2) for major sections.
- Use `###` (H3) for subsections.
- Avoid H4 and deeper nesting - restructure content if needed.
- Leave a blank line before and after headings.

### Formatting
- Use **bold** for emphasis on important terms.
- Use `backticks` for code, file names, and commands.
- Use _italics_ sparingly for definitions or foreign terms.
- Keep line length reasonable (soft wrap at ~80-100 characters).

## Code Blocks

Use fenced code blocks with language specification:

```typescript
function example(): string {
  return "Hello, world!";
}
```

Common language identifiers:
- `typescript` or `ts` - TypeScript code
- `tsx` - React/TypeScript JSX
- `javascript` or `js` - JavaScript
- `bash` or `sh` - Shell commands
- `sql` - SQL queries
- `json` - JSON data
- `yaml` - YAML configuration

## Lists

### Bullet Lists
- Use `-` for unordered lists.
- Keep list items concise.
- Use consistent capitalization.
- End items with periods if they are complete sentences.

### Numbered Lists
1. Use numbered lists for sequential steps.
2. Each step should be actionable.
3. Include expected outcomes where helpful.

## Links and References

- Use descriptive link text: `[TanStack Router docs](https://tanstack.com/router)`
- Avoid "click here" or raw URLs in text.
- Use relative paths for internal documentation links.

## Tables

Use tables for structured data:

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |

## Best Practices

- Write for developers who may not have full context.
- Include code examples where applicable.
- Keep documentation up to date with code changes.
- Use clear, concise language.
- Break up long paragraphs.
- Include a brief summary or overview at the start of long documents.

## File Naming

- Use lowercase with hyphens: `getting-started.md`
- Use descriptive names that reflect content.
- Group related docs in directories.

## README Files

Project and package README files should include:
- Brief description of purpose.
- Installation or setup instructions.
- Basic usage examples.
- Links to further documentation.
