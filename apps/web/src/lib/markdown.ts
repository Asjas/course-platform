import { useMemo } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function renderMarkdown(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);
  return result.toString();
}

export function useMarkdownPreview(markdown: string): string {
  return useMemo(() => {
    return markdown;
  }, [markdown]);
}
