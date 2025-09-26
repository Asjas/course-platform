import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import config from "~/config.js";
import { mySchema } from "~/db/schema.js";
import * as schemas from "~/db/schema/index.js";
import { DrizzleLogger } from "~/lib/logging.js";

const client = new Client({ connectionString: config.DATABASE_URL });

await client.connect();

export const db = drizzle({
  schema: {
    mySchema,
    ...schemas,
  },
  client: client,
  logger: new DrizzleLogger(),
  casing: "snake_case",
});
