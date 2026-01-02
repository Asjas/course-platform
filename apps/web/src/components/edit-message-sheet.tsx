import type { ChatMessage } from "@apps/server/src/routers/chat";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/shared-ui/components/tabs";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarkdownContent } from "~/components/markdown-content";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { renderMarkdown } from "~/lib/markdown";
import { cn } from "~/lib/utils";

interface MessageCollection {
  update(id: string, callback: (draft: { message: string }) => void): void;
}

interface EditMessageSheetProps {
  message: ChatMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: MessageCollection;
}

export default function EditMessageSheet({
  message,
  open,
  onOpenChange,
  collection,
}: EditMessageSheetProps) {
  const [editedMessage, setEditedMessage] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when message changes or sheet opens
  useEffect(() => {
    if (message && open) {
      setEditedMessage(message.message);
      setActiveTab("edit");
    }
  }, [message, open]);

  // Update preview when switching to preview tab or when message changes
  useEffect(() => {
    if (activeTab === "preview") {
      renderMarkdown(editedMessage)
        .then(setPreviewHtml)
        .catch((e) => {
          console.error(e);
          setPreviewHtml("<p>Error rendering preview</p>");
        });
    }
  }, [activeTab, editedMessage]);

  function handleSave() {
    if (!message) return;

    if (editedMessage.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }

    if (editedMessage === message.message) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);

    try {
      collection.update(message.id, (draft) => {
        draft.message = editedMessage;
      });
      toast.success("Message updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  }

  if (!message) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        className="flex w-full flex-col sm:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-xl">Edit Message</SheetTitle>
          <SheetDescription>
            Editing message from {message.username || message.name} •{" "}
            {format(message.timestamp, "PPp")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
          <Tabs
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4 grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:hover:text-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                value="edit"
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-400 dark:hover:text-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                value="preview"
              >
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent
              className="min-h-0 flex-1 overflow-hidden"
              value="edit"
            >
              <div className="flex h-full flex-col">
                <textarea
                  className={cn(
                    "custom-scrollbar h-full min-h-[300px] w-full flex-1 resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm",
                    "focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none",
                    "dark:border-gray-700 dark:bg-gray-800 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                  )}
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Edit your message..."
                  spellCheck
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supports Markdown formatting. Press{" "}
                  <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                    Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                    Enter
                  </kbd>{" "}
                  to save.
                </p>
              </div>
            </TabsContent>

            <TabsContent
              className="custom-scrollbar min-h-0 flex-1 overflow-y-auto"
              value="preview"
            >
              <div className="min-h-[300px] rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                {editedMessage.trim() ? (
                  <MarkdownContent
                    className="prose prose-sm dark:prose-invert max-w-none"
                    html={previewHtml}
                  />
                ) : (
                  <p className="text-gray-400 italic dark:text-gray-500">
                    Nothing to preview...
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="border-t border-gray-200 px-4 pt-4 dark:border-gray-700">
          <button
            className={cn(
              "w-full cursor-pointer rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white",
              "hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:focus:ring-offset-gray-900",
            )}
            type="button"
            onClick={handleSave}
            disabled={isSaving || editedMessage.trim() === ""}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
