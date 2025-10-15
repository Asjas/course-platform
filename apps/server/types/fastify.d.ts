import prometheus from "prom-client";
import type { Config } from "~/config.js";
import { db } from "~/db/index.js";
import mailer from "~/lib/mailer.js";
import { registry } from "~/lib/metrics.js";
import type { User } from "~/routes/users/mutations.ts";

declare module "fastify" {
  interface FastifyServerOptions {
    config: Config;
  }

  interface FastifyInstance {
    config: Config;
    db: typeof db;
    mailer: typeof mailer;
    prometheus: typeof prometheus;
    prometheusRegistry: typeof registry;
  }

  interface FastifyRequest {
    startTime: bigint;
    normalizedRoute: string;
    user: Pick<
      User,
      "id" | "email" | "emailVerified" | "role" | "banned"
    > | null;
  }
}
