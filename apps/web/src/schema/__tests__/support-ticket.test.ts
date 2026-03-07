import { supportTicketFormSchema } from "../support-ticket";
import { describe, expect, test } from "vitest";

describe("supportTicketFormSchema", () => {
  function validData() {
    return {
      title: "Need help with setup",
      description: "I cannot start the dev server",
      repo: null,
      priority: "medium" as const,
      status: "open" as const,
    };
  }

  test("accepts valid support ticket data", () => {
    const result = supportTicketFormSchema.safeParse(validData());
    expect(result.success).toBe(true);
  });

  test("rejects title shorter than 5 characters", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      title: "Help",
    });
    expect(result.success).toBe(false);
  });

  test("rejects title longer than 100 characters", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  test("accepts title with exactly 5 characters", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      title: "Hello",
    });
    expect(result.success).toBe(true);
  });

  test.each(["low", "medium", "high", "urgent"])(
    "accepts priority '%s'",
    (priority) => {
      const result = supportTicketFormSchema.safeParse({
        ...validData(),
        priority,
      });
      expect(result.success).toBe(true);
    },
  );

  test("rejects invalid priority", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });

  test.each(["open", "in_progress", "resolved", "closed"])(
    "accepts status '%s'",
    (status) => {
      const result = supportTicketFormSchema.safeParse({
        ...validData(),
        status,
      });
      expect(result.success).toBe(true);
    },
  );

  test("rejects invalid status", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  test("accepts optional nullable fields", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      repo: null,
      moduleId: null,
      lessonId: null,
    });
    expect(result.success).toBe(true);
  });

  test("accepts repo as string", () => {
    const result = supportTicketFormSchema.safeParse({
      ...validData(),
      repo: "https://github.com/user/repo",
    });
    expect(result.success).toBe(true);
  });
});
