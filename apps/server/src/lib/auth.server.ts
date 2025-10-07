import { instrumentBetterAuth } from "@kubiks/otel-better-auth";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import argon2 from "argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  haveIBeenPwned,
  organization,
  username,
} from "better-auth/plugins";
import { ulid } from "ulid";
import config from "~/config.js";
import { db } from "~/db/index.js";
import { ONE_HOUR, ONE_YEAR } from "~/lib/constants.js";
import { betterAuthLogger } from "~/lib/logging.js";
import { redis } from "~/lib/redis.js";

const polarClient = new Polar({
  accessToken: config.POLAR_ACCESS_TOKEN,
  server: config.NODE_ENV === "production" ? "production" : "sandbox",
});

export const auth = instrumentBetterAuth(
  betterAuth({
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
      async sendResetPassword() {
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
        generateId: () => ulid(),
      },
    },
    plugins: [
      admin(),
      haveIBeenPwned(),
      organization({ allowUserToCreateOrganization: false }),
      username({
        usernameValidator: (username) => {
          const invalidUsernames = ["admin", "support", "codewizard", "asjas"];

          return !invalidUsernames.includes(username);
        },
      }),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          portal(),
          checkout({
            products: [
              {
                productId: "bf729112-d838-49dd-88f0-91eb1cd88ca8",
                slug: "learn-fastify",
              },
            ],
            successUrl: config.POLAR_SUCCESS_URL,
            authenticatedUsersOnly: true,
          }),
        ],
      }),
    ],
    logger: betterAuthLogger,
  }) as ReturnType<typeof betterAuth>,
  {
    tracerName: "course-platform-auth",
  },
);
