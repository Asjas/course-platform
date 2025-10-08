import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/blog/")({
  component: BlogListPage,
});

const blogPosts = import.meta.glob("./*.mdx", {
  eager: true,
});

function BlogListPage() {
  // Process blog posts using useMemo to avoid recomputing unnecessarily
  const posts = useMemo(() => {
    const processedPosts = Object.entries(blogPosts).map(([path]) => {
      // Extract the slug from "./filename.mdx" → "filename"
      const slug = path.replace("./", "").replace(/\.mdx$/, "");

      const title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());

      return {
        slug,
        title,
      };
    });

    // Sort posts by slug (newest first)
    return processedPosts.sort((a, b) => {
      if (a.slug && b.slug) {
        return b.slug.localeCompare(a.slug);
      }
      return 0;
    });
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h2 className="mb-8 text-3xl font-bold">Blog Posts</h2>
      {posts.length > 0 ? (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              className="rounded-lg border border-gray-700 p-4 transition-colors"
              key={post.slug}
            >
              <Link
                className="text-xl font-medium hover:text-green-500"
                to="/blog/$slug"
                params={{ slug: post.slug }}
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading blog posts...</p>
      )}
    </div>
  );
}
