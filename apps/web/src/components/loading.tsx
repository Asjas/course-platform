import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-lg">
      <LoaderIcon
        className="animate-spin"
        size={42}
      />
    </div>
  );
}
