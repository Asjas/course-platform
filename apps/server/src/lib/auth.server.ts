import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import argon2 from "argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  anonymous,
  haveIBeenPwned,
  username,
} from "better-auth/plugins";
import { v7 as uuid } from "uuid";
import config from "~/config.js";
import { db } from "~/db/index.js";
import { ONE_HOUR, ONE_YEAR } from "~/lib/constants.js";
import { betterAuthLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

export const auth = betterAuth({
  appName: "Codewizard Training",
  trustedOrigins: ["http://localhost:3000", "https://codewizard.training"],
  secret: config.BETTER_AUTH_SECRET,
  session: {
    expiresIn: ONE_YEAR,
    cookieCache: {
      enabled: true,
      maxAge: ONE_HOUR,
    },
    createSessionOnSignIn: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async function (password) {
        const hashedPassword = await argon2.hash(password, {
          secret: Buffer.from(config.PEPPER_SECRET),
        });

        return hashedPassword;
      },
      verify: async function ({ hash, password }) {
        const verified = await argon2.verify(hash, password, {
          secret: Buffer.from(config.PEPPER_SECRET),
        });

        return verified;
      },
    },
    async sendResetPassword(url, user) {
      console.log("Send email to reset password");
    },
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
  },
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      await redis.set(key, value);
      if (ttl) await redis.expire(key, ttl);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  advanced: {
    database: {
      generateId: () => uuid(),
    },
  },
  plugins: [
    admin(),
    haveIBeenPwned(),
    anonymous(),
    username({
      usernameValidator: (username) => {
        const invalidUsernames = ["admin", "support", "codewizard"];

        return !invalidUsernames.includes(username);
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "bf729112-d838-49dd-88f0-91eb1cd88ca8",
              slug: "Learn-Fastify",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
      ],
    }),
  ],
  logger: betterAuthLogger,
}) as ReturnType<typeof betterAuth>;
