import { describe, expect, test, vi } from "vitest";

const { mockCreateTransport } = vi.hoisted(() => {
  const transporter = { sendMail: vi.fn(), close: vi.fn() };
  return {
    mockCreateTransport: vi.fn(() => transporter),
  };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: mockCreateTransport },
}));

vi.mock("~/config.js", () => ({
  default: {
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: 587,
    SMTP_SECURE: true,
    SMTP_USER: "user@example.com",
    SMTP_PASS: "secret-password",
  },
}));

describe("mailer", () => {
  // Module is imported once at file level, so createTransport is called once.
  // We test all aspects of that single call.
  test("creates transport with correct SMTP host, port, and secure settings", async () => {
    await import("../mailer.js");

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.example.com",
        port: 587,
        secure: true,
      }),
    );
  });

  test("creates transport with auth credentials and pool enabled", async () => {
    // The module was already imported above; createTransport was called once.
    // Verify the same call included auth and pool settings.
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: {
          user: "user@example.com",
          pass: "secret-password",
        },
        pool: true,
      }),
    );
  });

  test("exports a transporter instance", async () => {
    const { default: mailer } = await import("../mailer.js");

    expect(mailer).toBeDefined();
    expect(mailer).toHaveProperty("sendMail");
  });
});
