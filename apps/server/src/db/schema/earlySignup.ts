import { index, text, timestamp } from "drizzle-orm/pg-core";
import { mySchema } from "~/db/my-schema.js";
import { timestamps } from "~/db/schema/columns.helpers.js";

// Enum for signup source
export const signupSource = mySchema.enum("signup_source", [
  "learnfastify",
  "codewizard",
  "other",
]);

// Early signup table for course waitlist/pre-launch signups
export const earlySignup = mySchema.table(
  "early_signup",
  {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    name: text(),
    source: signupSource().default("learnfastify").notNull(),
    referrer: text(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    confirmedAt: timestamp({ withTimezone: true }),
    unsubscribedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("early_signup_email_idx").on(table.email),
    index("early_signup_source_idx").on(table.source),
    index("early_signup_created_at_idx").on(table.createdAt),
  ],
);

// Type exports
export type EarlySignup = typeof earlySignup.$inferSelect;
export type NewEarlySignup = typeof earlySignup.$inferInsert;
