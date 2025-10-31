import * as coupon from "./schema/coupon.ts";
import * as course from "./schema/course.ts";
import * as enrollment from "./schema/enrollment.ts";
import * as announcement from "./schema/platform-announcement.ts";
import * as progress from "./schema/progress.ts";
import * as purchase from "./schema/purchase.ts";
import * as support from "./schema/support-ticket.ts";
import * as team from "./schema/team-license.ts";
import * as user from "./schema/user.ts";
import config from "@packages/schema/db-config.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";

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
