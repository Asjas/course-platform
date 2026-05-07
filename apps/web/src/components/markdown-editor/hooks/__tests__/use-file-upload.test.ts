import { useFileUpload } from "../use-file-upload";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { fromAny } from "@total-typescript/shoehorn";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockMutateAsync, mockToast } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockToast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => "toast-id"),
  },
}));

vi.mock("~/lib/trpc.client", () => ({
  trpc: {
    images: {
      getPresignedUrl: {
        mutationOptions: vi.fn(() => ({
          mutationFn: mockMutateAsync,
        })),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("~/lib/attachments", () => ({
  validateFile: vi.fn(() => null), // no validation error by default
  generateAttachmentMarkdown: vi.fn(
    (name: string, url: string) => `![${name}](${url})`,
  ),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    QueryClientProvider,
    { client: makeQueryClient() },
    children,
  );
}

function makeTextareaRef(
  value = "",
): React.RefObject<HTMLTextAreaElement | null> {
  const el = {
    selectionStart: value.length,
    focus: vi.fn(),
    setSelectionRange: vi.fn(),
  };
  return fromAny({ current: el });
}

describe("useFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns expected handlers and uploadingCount = 0 initially", () => {
    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    expect(result.current.uploadingCount).toBe(0);
    expect(typeof result.current.handleDragOver).toBe("function");
    expect(typeof result.current.handleDrop).toBe("function");
    expect(typeof result.current.handleFileSelect).toBe("function");
  });

  it("handleDragOver calls preventDefault and stopPropagation", () => {
    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    const event: React.DragEvent<Element> = fromAny({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    act(() => {
      result.current.handleDragOver(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it("handleDrop does nothing if no files are dropped", async () => {
    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    const event: React.DragEvent<Element> = fromAny({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [] },
    });

    await act(async () => {
      await result.current.handleDrop(event);
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("handleFileSelect does nothing if no files selected", async () => {
    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    const event: React.ChangeEvent<HTMLInputElement> = fromAny({
      target: { files: null, value: "" },
    });

    await act(async () => {
      await result.current.handleFileSelect(event);
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shows validation error toast when file fails validation", async () => {
    const { validateFile } = await import("~/lib/attachments");
    vi.mocked(validateFile).mockReturnValue("File too large");

    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    const file = new File(["content"], "big.jpg", { type: "image/jpeg" });
    const event: React.DragEvent<Element> = fromAny({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [file] },
    });

    await act(async () => {
      await result.current.handleDrop(event);
    });

    expect(mockToast.error).toHaveBeenCalledWith("File too large");
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("uploads file and inserts markdown on success", async () => {
    const { validateFile } = await import("~/lib/attachments");
    vi.mocked(validateFile).mockReturnValue(null);
    mockMutateAsync.mockResolvedValue({
      presignedUrl: "https://r2.example.com/presigned",
      publicUrl: "https://cdn.example.com/photo.jpg",
    });

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const onChange = vi.fn();
    const textareaRef = makeTextareaRef();

    const { result } = renderHook(
      () => useFileUpload({ value: "", onChange, textareaRef }),
      { wrapper },
    );

    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const event: React.DragEvent<Element> = fromAny({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [file] },
    });

    await act(async () => {
      await result.current.handleDrop(event);
    });

    expect(mockMutateAsync).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining("uploaded"),
    );
  });
});
