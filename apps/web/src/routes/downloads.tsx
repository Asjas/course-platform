import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/downloads")({
  component: DownloadsComponent,
});

function DownloadsComponent() {
  return <div>Hello /downloads!</div>;
}
