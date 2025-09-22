import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import config from "~/config.js";
import * as userSchema from "~/db/schema/user.js";
import { DrizzleLogger } from "~/lib/logging.js";

const client = new Client({ connectionString: config.DATABASE_URL });

await client.connect();

export const db = drizzle({
  schema: { ...userSchema },
  client: client,
  logger: new DrizzleLogger(),
  casing: "snake_case",
});
