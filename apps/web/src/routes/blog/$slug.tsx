import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

const blogPosts = import.meta.glob("./*.mdx", {
  eager: true,
});

function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });

  const blogPost = useMemo(() => {
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

  const Content = (blogPost as any).default as React.ComponentType<any>;

  return (
    <div className="container mx-auto max-w-3xl px-8 py-12">
      <article className="prose lg:prose-xl prose-invert">
        <Content />
      </article>

      <div className="mt-12 border-t border-gray-700 pt-6">
        <Link
          className="flex items-center text-green-500 hover:text-green-400"
          to="/blog"
        >
          <ArrowLeftIcon
            className="mr-2"
            size={20}
          />
          Back to all posts
        </Link>
      </div>
    </div>
  );
}
