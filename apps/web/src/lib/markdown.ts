import DOMPurify from "dompurify";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function renderMarkdown(
  markdown: string | undefined,
): Promise<string> {
  if (!markdown) return "<p>Nothing to preview</p>";

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);
  const dirty = result.toString();
  const clean = DOMPurify.sanitize(dirty);

  return clean;
}
