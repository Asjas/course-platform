import { db } from "@packages/db";
import prometheus from "prom-client";
import type { Config } from "~/config.js";
import { cache } from "~/lib/cache.js";
import mailer from "~/lib/mailer.js";
import { registry } from "~/lib/metrics.js";
import type { User } from "~/routers/users/mutations.ts";

declare module "fastify" {
  interface FastifyServerOptions {
    config: Config;
  }

  interface FastifyInstance {
    config: Config;
    cache: typeof cache;
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
