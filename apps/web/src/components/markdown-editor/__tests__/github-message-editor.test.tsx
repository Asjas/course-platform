import GitHubMessageEditor from "../github-message-editor";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    images: {
      getPresignedUrl: {
        mutationOptions: vi.fn(() => ({})),
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
  const defaultProps = {
    id: "test-editor",
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the editor with textarea", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          placeholder="Custom placeholder"
        />,
      );

      const textarea = screen.getByPlaceholderText("Custom placeholder");
      expect(textarea).toBeInTheDocument();
    });

    it("should render default placeholder", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Add your comment...");
      expect(textarea).toBeInTheDocument();
    });

    it("should render Write and Preview tabs", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Preview/ }),
      ).toBeInTheDocument();
    });

    it("should render formatting toolbar in Write mode", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      expect(
        screen.getByRole("toolbar", { name: "Formatting tools" }),
      ).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("should switch to Preview tab when clicked", async () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );

      const previewTab = screen.getByRole("button", { name: /Preview/ });
      await userEvent.click(previewTab);

      // Preview mode should be active (no toolbar visible)
      expect(
        screen.queryByRole("toolbar", { name: "Formatting tools" }),
      ).not.toBeInTheDocument();
    });

    it("should switch back to Write tab when clicked", async () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );

      // Switch to preview
      const previewTab = screen.getByRole("button", { name: /Preview/ });
      await userEvent.click(previewTab);

      // Switch back to write
      const writeTab = screen.getByRole("button", { name: "Write" });
      await userEvent.click(writeTab);

      expect(
        screen.getByRole("toolbar", { name: "Formatting tools" }),
      ).toBeInTheDocument();
    });
  });

  describe("Text Input", () => {
    it("should call onChange when typing", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Hello");

      expect(onChange).toHaveBeenCalled();
    });

    it("should display the current value", () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          value="Current text"
        />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Current text");
    });
  });

  describe("Formatting Buttons", () => {
    it("should render all formatting buttons", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

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
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const headerButton = screen.getByRole("button", {
        name: "Add header text",
      });
      await userEvent.click(headerButton);

      expect(onChange).toHaveBeenCalled();
      // The onChange should be called with a function that adds "### "
      const callArg = onChange.mock.calls[0][0];
      if (typeof callArg === "function") {
        expect(callArg("")).toBe("### ");
      }
    });

    it("should insert bold markdown when bold button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const boldButton = screen.getByRole("button", { name: "Add bold text" });
      await userEvent.click(boldButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert italic markdown when italic button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const italicButton = screen.getByRole("button", {
        name: "Add italic text",
      });
      await userEvent.click(italicButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert quote markdown when quote button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const quoteButton = screen.getByRole("button", {
        name: "Insert a quote",
      });
      await userEvent.click(quoteButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert code markdown when code button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const codeButton = screen.getByRole("button", {
        name: "Add inline code",
      });
      await userEvent.click(codeButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert link markdown when link button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const linkButton = screen.getByRole("button", { name: "Add a link" });
      await userEvent.click(linkButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert bullet list markdown when bullet list button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const listButton = screen.getByRole("button", {
        name: "Add a bulleted list",
      });
      await userEvent.click(listButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should insert numbered list markdown when numbered list button clicked", async () => {
      const onChange = vi.fn();
      render(
        <GitHubMessageEditor
          {...defaultProps}
          onChange={onChange}
        />,
      );

      const numberedListButton = screen.getByRole("button", {
        name: "Add a numbered list",
      });
      await userEvent.click(numberedListButton);

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Mention Button", () => {
    it("should render mention button when mentionContext is provided", () => {
      render(
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
      render(<GitHubMessageEditor {...defaultProps} />);

      expect(
        screen.queryByRole("button", { name: "Mention someone" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("File Upload Area", () => {
    it("should render file upload area", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      expect(
        screen.getByText("Paste, drop, or click to add files."),
      ).toBeInTheDocument();
    });
  });

  describe("Markdown Help Link", () => {
    it("should render markdown help link", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      // Check for the SVG markdown icon (it's a link to GitHub markdown docs)
      const markdownLink = screen.getByRole("link");
      expect(markdownLink).toHaveAttribute(
        "href",
        "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-labels on buttons", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      const toolbar = screen.getByRole("toolbar", { name: "Formatting tools" });
      expect(toolbar).toBeInTheDocument();

      // All formatting buttons should have aria-labels
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // Skip tab buttons which use text content
        if (
          button.textContent !== "Write" &&
          !button.textContent?.includes("Preview")
        ) {
          expect(
            button.getAttribute("aria-label") || button.textContent,
          ).toBeTruthy();
        }
      });
    });

    it("should have icons with aria-hidden", () => {
      render(<GitHubMessageEditor {...defaultProps} />);

      // SVG icons should be hidden from screen readers
      const svgIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Preview Mode", () => {
    it("should show preview content when in Preview mode", async () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          value="Test content"
        />,
      );

      const previewTab = screen.getByRole("button", { name: /Preview/ });
      await userEvent.click(previewTab);

      // Wait for markdown to be rendered
      await waitFor(() => {
        // The preview should contain rendered markdown
        const previewContent = document.querySelector(".prose");
        expect(previewContent).toBeInTheDocument();
      });
    });

    it('should show "Nothing to preview" when value is empty', async () => {
      render(
        <GitHubMessageEditor
          {...defaultProps}
          value=""
        />,
      );

      const previewTab = screen.getByRole("button", { name: /Preview/ });
      await userEvent.click(previewTab);

      await waitFor(() => {
        expect(screen.getByText("Nothing to preview")).toBeInTheDocument();
      });
    });
  });
});
