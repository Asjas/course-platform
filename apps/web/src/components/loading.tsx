import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 text-center text-lg"
      role="status"
      aria-live="polite"
    >
      <LoaderIcon
        className="animate-spin"
        size={42}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
