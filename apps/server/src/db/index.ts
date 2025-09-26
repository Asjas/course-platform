import { drizzle } from "drizzle-orm/node-postgres";
import { pgSchema } from "drizzle-orm/pg-core";
import { Client } from "pg";
import config from "~/config.js";
import * as couponSchema from "~/db/schema/coupon.js";
import * as courseSchema from "~/db/schema/course.js";
import * as enrollmentSchema from "~/db/schema/enrollment.js";
import * as platformSchema from "~/db/schema/platform.js";
import * as progressSchema from "~/db/schema/progress.js";
import * as purchaseSchema from "~/db/schema/purchase.js";
import * as supportSchema from "~/db/schema/support.js";
import * as teamLicenseSchema from "~/db/schema/teamLicense.js";
import * as userSchema from "~/db/schema/user.js";
import { DrizzleLogger } from "~/lib/logging.js";

const client = new Client({ connectionString: config.DATABASE_URL });

export const mySchema = pgSchema("my_schema");

export const db = drizzle({
  schema: {
    ...userSchema,
    ...couponSchema,
    ...courseSchema,
    ...enrollmentSchema,
    ...progressSchema,
    ...purchaseSchema,
    ...supportSchema,
    ...teamLicenseSchema,
    ...platformSchema,
  },
  client: client,
  logger: new DrizzleLogger(),
  casing: "snake_case",
});
