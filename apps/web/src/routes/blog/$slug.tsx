import {
  Link,
  createFileRoute,
  notFound,
  useParams,
} from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

const blogPosts = import.meta.glob<{ default: React.ComponentType }>(
  "./*.mdx",
  {
    eager: true,
  },
);

function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });

  const blogPost = useMemo<{ default: React.ComponentType } | null>(() => {
    const postPath = `./${slug}.mdx`;

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

  const Content = blogPost.default;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl px-8 py-12">
        <article className="prose lg:prose-xl prose-gray dark:prose-invert">
          <Content />
        </article>

        <div className="mt-12 border-t border-gray-300 pt-6 dark:border-gray-700">
          <Link
            className="flex items-center text-green-600 hover:text-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:text-green-400 dark:hover:text-green-300"
            to="/blog"
          >
            <ArrowLeftIcon
              className="mr-2"
              size={20}
              aria-hidden="true"
            />
            Back to all posts
          </Link>
        </div>
      </div>
    </main>
  );
}
