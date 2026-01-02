import type { MentionContext } from "~/components/mention-picker";

export interface GitHubMessageEditorProps {
  id: string;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  placeholder?: string;
  /**
   * Context for the mention picker (determines which users can be mentioned)
   */
  mentionContext?: MentionContext;
}

export type EditorTab = "write" | "preview";

export interface FormattingAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ "size": number; "aria-hidden": boolean }>;
  handler: (params: FormattingParams) => void;
}

export interface FormattingParams {
  textarea: HTMLTextAreaElement;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
}

export interface MentionUser {
  name: string;
  username: string | null;
  displayUsername: string | null;
}
