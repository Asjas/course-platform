import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "node:path";
import { db, pool } from "~/db/index.js";

interface BootstrapLogger {
  info: (message: string) => void;
}

const migrationsFolder = join(import.meta.dirname, "..", "..", "drizzle");
const ensureDefaultUsersSql = `
INSERT INTO "my_schema"."user" (id, name, username, email, email_verified)
VALUES ('ghost', 'Ghost', 'ghost', 'ghost@codewizard.training', true)
ON CONFLICT (id) DO NOTHING;
`;

export async function bootstrapDatabase(
  logger: BootstrapLogger,
): Promise<void> {
  logger.info("Running database migrations");
  await migrate(db, { migrationsFolder });

  logger.info("Ensuring default database users exist");
  await pool.query(ensureDefaultUsersSql);

  logger.info("Database bootstrap complete");
}
