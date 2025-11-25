import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export default function ErrorBoundaryComponent({ error }: { error: Error }) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-red-600">
      <p className="text-lg">{error.message}</p>
      <button
        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-800 active:bg-red-700"
        type="reset"
        onClick={(event) => {
          event.preventDefault();
          router.invalidate();
        }}
      >
        Reload page
      </button>
    </div>
  );
}
