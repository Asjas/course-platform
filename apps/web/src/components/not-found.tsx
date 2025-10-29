import { Link } from "~/components/ui/nav-link.tsx";

export default function NotFoundComponent() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-red-600">
      <p className="text-xl">Page not found</p>
      <Link
        className="px-4 py-2 text-white underline hover:no-underline"
        to="/"
      >
        Go to home
      </Link>
    </div>
  );
}
