import { pgSchema } from "drizzle-orm/pg-core";

const schemaName = process.env.DATABASE_SCHEMA || "my_schema";

export const mySchema = pgSchema(schemaName);
