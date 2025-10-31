import { isValid } from "ulid";
import * as z from "zod";

export const prefixedUlid = z.string().transform((string, ctx) => {
  if (!string.includes(":")) {
    ctx.addIssue({
      code: "custom",
      message: "Missing prefix (expected 'prefix:ulid')",
    });
    return z.NEVER;
  }

  const id = string.split(":", 2)[1];

  if (!isValid(id)) {
    ctx.addIssue({ code: "custom", message: "Invalid ULID" });
    return z.NEVER;
  }

  return id;
});
