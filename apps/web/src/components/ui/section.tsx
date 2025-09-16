import type { ReactNode } from "react";

export default function Section({ children }: { children: ReactNode }) {
  return (
    <section className="w-full px-4 py-20 sm:px-6 lg:px-8">{children}</section>
  );
}
