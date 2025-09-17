import type { ReactNode } from "react";

export default function Section({ children }: { children: ReactNode }) {
  return <section className="w-full py-20">{children}</section>;
}
