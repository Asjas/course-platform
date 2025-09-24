import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/blog/")({
  component: BlogListPage,
});

const blogPosts = import.meta.glob("./*.mdx", {
  eager: true,
});

function BlogListPage() {
  const [posts, setPosts] = useState<
    Array<{ slug: string; title: string; date?: string }>
  >([]);

  useEffect(() => {
    // Process the blog posts
    const processedPosts = Object.entries(blogPosts).map(([path, module]) => {
      // Extract the slug from "./filename.md" → "filename"
      const slug = path.replace("./", "").replace(/\.mdx$/, "");

      // Get metadata if available
      const frontmatter =
        (module as any).frontmatter ||
        (module as any).metadata ||
        (module as any).attributes ||
        {};

      // Use frontmatter title or generate from slug
      const title =
        frontmatter.title ||
        slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (match) => match.toUpperCase());

      return {
        slug,
        title,
        date: frontmatter.date,
      };
    });

    // Sort posts by date if available (newest first)
    const sortedPosts = processedPosts.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    setPosts(sortedPosts);
  }, []);

  return (
    <main className="container mx-auto p-8">
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
              {post.date && (
                <p className="mt-2 text-sm text-gray-400">
                  {new Date(post.date).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading blog posts...</p>
      )}
    </main>
  );
}
