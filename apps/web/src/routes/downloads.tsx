import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/downloads")({
  component: DownloadsPage,
});

function DownloadsPage() {
  return <div>Hello /downloads!</div>;
}
