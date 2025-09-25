import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import config from "~/config.js";
import * as couponSchema from "~/db/schema/coupon.js";
import * as courseSchema from "~/db/schema/course.js";
import * as enrollmentSchema from "~/db/schema/enrollment.js";
import * as progressSchema from "~/db/schema/progress.js";
import * as purchaseSchema from "~/db/schema/purchase.js";
import * as supportSchema from "~/db/schema/support.js";
import * as teamLicenseSchema from "~/db/schema/teamLicense.js";
import * as userSchema from "~/db/schema/user.js";
import { DrizzleLogger } from "~/lib/logging.js";

const client = new Client({ connectionString: config.DATABASE_URL });

await client.connect();

export const db = drizzle({
  schema: {
    ...couponSchema,
    ...courseSchema,
    ...enrollmentSchema,
    ...progressSchema,
    ...purchaseSchema,
    ...supportSchema,
    ...teamLicenseSchema,
    ...userSchema,
  },
  client: client,
  logger: new DrizzleLogger(),
  casing: "snake_case",
});
