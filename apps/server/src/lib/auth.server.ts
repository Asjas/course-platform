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
import { ONE_HOUR, ONE_WEEK, ONE_YEAR } from "~/lib/constants.js";
import { betterAuthLogger } from "~/lib/logging.js";
import mailer from "~/lib/mailer.js";
import { redis } from "~/lib/redis.js";

const polarClient = new Polar({
  accessToken: config.POLAR_ACCESS_TOKEN,
  server: config.NODE_ENV === "production" ? "production" : "sandbox",
});

export const auth = betterAuth({
  appName: "Codewizard Training",
  trustedOrigins: [config.ORIGIN],
  secret: config.BETTER_AUTH_SECRET,
  session: {
    expiresIn: ONE_YEAR,
    updateAge: ONE_WEEK * 4,
    cookieCache: {
      enabled: true,
      maxAge: ONE_HOUR,
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendOnSignIn: true,
    async sendVerificationEmail(data) {
      let text = "";

      text += `Please verify your email address by clicking the link below:\n\n${config.ORIGIN}/verify-email?=${data.token}`;
      text += `\n\nIf you did not create an account, please ignore this email.`;
      text += `\n\nThis link will expire in 1 hour.`;
      text += `\n\n--\n© ${new Date().getFullYear()} Codewizard Training. All rights reserved.`;

      await mailer.sendMail({
        sender: "Codewizard Training <support@codewizard.training>",
        replyTo: "support@codewizard.training",
        to: data.user.email,
        subject: "Verify your email address",
        text,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 5,
    maxPasswordLength: 80,
    revokeSessionsOnPasswordReset: true,
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
    async sendResetPassword({ user, token }) {
      let text = "";

      text += `You can reset your password by clicking the link below:\n\n${config.ORIGIN}/reset-password?token=${token}`;
      text += `\n\nIf you did not request a password reset, please ignore this email.`;
      text += `\n\nThis link will expire in 1 hour.`;
      text += `\n\n--\n© ${new Date().getFullYear()} Codewizard Training. All rights reserved.`;

      await mailer.sendMail({
        sender: "Codewizard Training <support@codewizard.training>",
        replyTo: "support@codewizard.training",
        to: user.email,
        subject: "Reset your password",
        text,
      });
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
    cookiePrefix: "cw",
    database: {
      generateId: () => `user:${ulid()}`,
    },
  },
  plugins: [
    admin({ defaultRole: "member" }),
    haveIBeenPwned(),
    organization({ allowUserToCreateOrganization: false }),
    username({
      usernameValidator: (username) => {
        const invalidUsernames = ["admin", "support", "asjas"];

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
              productId: config.LEARN_FASTIFY_POLAR_PRODUCT_ID,
              slug: "learn-fastify",
            },
          ],
          successUrl: config.POLAR_SUCCESS_URL,
        }),
      ],
    }),
  ],
  logger: betterAuthLogger,
}) as ReturnType<typeof betterAuth>;
