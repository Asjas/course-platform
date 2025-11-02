import config from "@packages/schema/db-config.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";
import * as coupon from "~/schema/coupon.js";
import * as course from "~/schema/course.js";
import * as enrollment from "~/schema/enrollment.js";
import * as announcement from "~/schema/platform-announcement.js";
import * as progress from "~/schema/progress.js";
import * as purchase from "~/schema/purchase.js";
import * as support from "~/schema/support-ticket.js";
import * as team from "~/schema/team-license.js";
import * as user from "~/schema/user.js";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 100,
  Client,
});

await pool.connect();

export const db = drizzle({
  schema: {
    ...user,
    ...coupon,
    ...course,
    ...purchase,
    ...support,
    ...enrollment,
    ...team,
    ...progress,
    ...announcement,
  },
  client: pool,
  casing: "snake_case",
});

export { pool };
export { eq, sql } from "drizzle-orm";
