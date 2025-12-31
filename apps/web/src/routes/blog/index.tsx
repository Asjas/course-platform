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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Blog Posts
        </h1>
        {posts.length > 0 ? (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                className="rounded-lg border border-gray-200 bg-white p-4 transition-colors dark:border-gray-700 dark:bg-gray-800"
                key={post.slug}
              >
                <Link
                  className="text-xl font-medium text-gray-900 hover:text-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:text-white dark:hover:text-green-400"
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Loading blog posts...
          </p>
        )}
      </div>
    </main>
  );
}
