import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

// Import all markdown files from the blog directory
const blogPosts = import.meta.glob("../blog/*.md", {
  eager: true,
});

function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });

  // Find the matching blog post module
  const blogPost = useMemo(() => {
    // Need to adjust path for proper lookup
    const postPath = `../blog/${slug}.md`;

    if (!(postPath in blogPosts)) {
      console.error(`Blog post not found: ${postPath}`);
      console.log("Available posts:", Object.keys(blogPosts));
      return null;
    }

    return blogPosts[postPath];
  }, [slug]);

  // If blog post not found, show 404
  if (!blogPost) {
    return notFound();
  }

  // Get the HTML content
  const content = (blogPost as any).default || (blogPost as any).html || "";
  const frontmatter =
    (blogPost as any).frontmatter || (blogPost as any).metadata || {};

  return (
    <div className="container mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">{frontmatter.title || slug}</h1>
        {frontmatter.date && (
          <p className="text-gray-400">
            {new Date(frontmatter.date).toLocaleDateString()}
          </p>
        )}
      </div>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-12 border-t border-gray-700 pt-6">
        <Link
          className="text-green-500 hover:text-green-400"
          to="/blog"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
