import DOMPurify from "dompurify";
import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeMediaEmbed } from "~/lib/rehype-media-embed";

export async function renderMarkdown(
  markdown: string | undefined,
): Promise<string> {
  if (!markdown) return "<p>Nothing to preview</p>";

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeExternalLinks, { rel: ["nofollow"] })
    .use(rehypeMediaEmbed)
    .use(rehypeHighlight)
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  const dirty = result.toString();
  const clean = DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "data-video-url",
      "data-embed-url",
    ],
  });

  return clean;
}
