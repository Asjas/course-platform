import type { ChatMessage } from "@apps/server/src/routers/chat";
import { formatDate } from "date-fns";
import { useEffect, useState } from "react";
import { renderMarkdown } from "~/lib/markdown";

export default function ChatMessage({ msg }: { msg: ChatMessage }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    renderMarkdown(msg.message)
      .then(setHtml)
      .catch((error) => {
        console.error("Error rendering markdown:", error);
        setHtml("<p>Error rendering message</p>");
      });
  }, [msg.message]);

  return (
    <div className="flex gap-2 rounded-md py-1.5 hover:bg-gray-900/55">
      <div className="flex w-14 justify-end">
        <span className="text-[14px] text-gray-300/75">
          {formatDate(msg.timestamp, "HH:mm")}
        </span>
      </div>
      <div className="flex flex-1 items-baseline gap-1">
        <span className="shrink-0 text-sm font-medium text-green-600">
          {msg.username || msg.name}:
        </span>
        <div
          className="text-sm text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
