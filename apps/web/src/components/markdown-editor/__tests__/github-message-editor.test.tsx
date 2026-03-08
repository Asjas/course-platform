import GitHubMessageEditor from "../github-message-editor";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "~/test-utils";

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    images: {
      getPresignedUrl: {
        mutationOptions: vi.fn(() => ({
          mutationFn: vi
            .fn()
            .mockResolvedValue({ presignedUrl: "", publicUrl: "" }),
        })),
      },
    },
  },
}));

vi.mock("~/components/mention-picker", () => ({
  MentionPicker: () => null,
}));

vi.mock("~/lib/markdown", () => ({
  renderMarkdown: vi.fn(async (text: string) => `<p>${text}</p>`),
}));

describe("GitHubMessageEditor", () => {
  const defaultProps = { id: "test-editor", value: "", onChange: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the editor with textarea", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          placeholder="Custom placeholder"
        />,
      );
      expect(
        screen.getByPlaceholderText("Custom placeholder"),
      ).toBeInTheDocument();
    });

    it("should render default placeholder", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("Add your comment..."),
      ).toBeInTheDocument();
    });

    it("should render Write and Preview tabs", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Preview/ }),
      ).toBeInTheDocument();
    });

    it("should render formatting toolbar in Write mode", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(
        screen.getByRole("toolbar", { name: "Formatting tools" }),
      ).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("should switch to Preview tab when clicked", async () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /Preview/ }));
      expect(
        screen.queryByRole("toolbar", { name: "Formatting tools" }),
      ).not.toBeInTheDocument();
    });

    it("should switch back to Write tab when clicked", async () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /Preview/ }));
      await userEvent.click(screen.getByRole("button", { name: "Write" }));
      expect(
        screen.getByRole("toolbar", { name: "Formatting tools" }),
      ).toBeInTheDocument();
    });
  });

  describe("Text Input", () => {
    it("should call onChange when typing", async () => {
      const onChange = vi.fn();
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );
      await userEvent.type(screen.getByRole("textbox"), "Hello");
      expect(onChange).toHaveBeenCalled();
    });

    it("should display the current value", () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          value="Current text"
        />,
      );
      expect(screen.getByRole("textbox")).toHaveValue("Current text");
    });
  });

  describe("Formatting Buttons", () => {
    it("should render all formatting buttons", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "Add header text" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add bold text" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add italic text" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Insert a quote" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add inline code" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add a link" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add a bulleted list" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add a numbered list" }),
      ).toBeInTheDocument();
    });

    it("should insert header markdown when heading button clicked", async () => {
      const onChange = vi.fn();
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Add header text" }),
      );
      expect(onChange).toHaveBeenCalled();
      const callArg = onChange.mock.calls[0][0];
      if (typeof callArg === "function") {
        expect(callArg("")).toBe("### ");
      }
    });

    it("should insert bold markdown when bold button clicked", async () => {
      const onChange = vi.fn();
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Add bold text" }),
      );
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Mention Button", () => {
    it("should render mention button when mentionContext is provided", () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          mentionContext={{ type: "channel", channelId: "general" }}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Mention someone" }),
      ).toBeInTheDocument();
    });

    it("should not render mention button when mentionContext is not provided", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(
        screen.queryByRole("button", { name: "Mention someone" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("File Upload Area", () => {
    it("should render file upload area", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      expect(
        screen.getByText("Paste, drop, or click to add files."),
      ).toBeInTheDocument();
    });
  });

  describe("Markdown Help Link", () => {
    it("should render markdown help link", () => {
      renderWithQueryClient(<GitHubMessageEditor {...defaultProps} />);
      const markdownLink = screen.getByRole("link");
      expect(markdownLink).toHaveAttribute(
        "href",
        "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
      );
    });
  });

  describe("Preview Mode", () => {
    it("should show preview content when in Preview mode", async () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /Preview/ }));
      await waitFor(() => {
        expect(document.querySelector(".prose")).toBeInTheDocument();
      });
    });

    it('should show "Nothing to preview" when value is empty', async () => {
      renderWithQueryClient(
        <GitHubMessageEditor
          {...defaultProps}
          value=""
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /Preview/ }));
      await waitFor(() => {
        expect(screen.getByText("Nothing to preview")).toBeInTheDocument();
      });
    });
  });
});
