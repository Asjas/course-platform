import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  type Coupon,
  deleteCouponByCode,
  deleteCouponById,
  insertCoupon,
  updateCouponByCode,
  updateCouponById,
} from "~/db/mutations/coupon.js";
import {
  getAllCoupons,
  getCouponByCode,
  getCouponById,
} from "~/db/queries/coupon.js";
import {
  CACHE_PRIVATE_REVALIDATE,
  FIVE_MINUTES,
  ONE_DAY,
} from "~/lib/constants.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:coupons:private" });

export default function couponRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/coupons", async (_request, reply) => {
    const coupons = await getAllCoupons();

    if (!coupons) {
      log.warn("No coupons found");
      return reply.status(404).send({ error: "No coupons found" });
    }

    reply.headers(
      CACHE_PRIVATE_REVALIDATE({
        maxAge: FIVE_MINUTES,
        staleIfError: ONE_DAY * 2,
      }),
    );

    log.info(
      { count: coupons.count },
      "Fetched all coupons with private caching",
    );

    return coupons;
  });

  fastify.get(
    "/coupons/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params;

      try {
        const coupon = await getCouponById(id);

        if (!coupon) {
          log.warn({ id }, "Coupon not found");
          return reply.status(404).send({ error: "Coupon not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info({ id }, "Fetched coupon by ID with private caching");

        return coupon;
      } catch (error) {
        log.error({ err: error, id }, "Error fetching coupon by ID");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.get(
    "/coupons/code/:code",
    async (request: FastifyRequest<{ Params: { code: string } }>, reply) => {
      const { code } = request.params;

      try {
        const coupon = await getCouponByCode(code);

        if (!coupon) {
          log.warn({ code }, "Coupon not found");
          return reply.status(404).send({ error: "Coupon not found" });
        }

        reply.headers(
          CACHE_PRIVATE_REVALIDATE({
            maxAge: ONE_DAY,
            staleIfError: ONE_DAY * 2,
          }),
        );

        log.info({ code }, "Fetched coupon by code with private caching");

        return coupon;
      } catch (error) {
        log.error({ err: error, code }, "Error fetching coupon by code");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.post(
    "/coupons",
    async (request: FastifyRequest<{ Body: { newCoupon: Coupon } }>, reply) => {
      const { newCoupon } = request.body;

      try {
        const result = await insertCoupon({ newCoupon });

        if (!result) {
          log.error({ newCoupon }, "Failed to create coupon");
          return reply.status(500).send({ error: "Failed  to create coupon" });
        }

        log.info({ id: result[0].id }, "Coupon created successfully");

        return reply.status(201).send(result[0]);
      } catch (error) {
        log.error({ err: error, newCoupon }, "Error creating coupon");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.put(
    "/coupons/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { updates: Partial<Coupon> };
      }>,
      reply,
    ) => {
      const { id } = request.params;
      const { updates } = request.body;

      try {
        const existingCoupon = await getCouponById(id);
        if (!existingCoupon) {
          log.warn({ id }, "Coupon not found for update");
          return reply.status(404).send({ error: "Coupon not found" });
        }

        const updatedCoupon = await updateCouponById(id, updates);
        if (!updatedCoupon) {
          log.error({ id, updates }, "Failed to update coupon");
          return reply.status(500).send({ error: "Failed to update coupon" });
        }

        log.info({ id }, "Coupon updated successfully");
        return reply.status(200).send(updatedCoupon);
      } catch (error) {
        log.error({ err: error, id, updates }, "Error updating coupon");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.put(
    "/coupons/code/:code",
    async (
      request: FastifyRequest<{
        Params: { code: string };
        Body: { updates: Partial<Coupon> };
      }>,
      reply,
    ) => {
      const { code } = request.params;
      const { updates } = request.body;

      try {
        const existingCoupon = await getCouponByCode(code);
        if (!existingCoupon) {
          log.warn({ code }, "Coupon not found for update");
          return reply.status(404).send({ error: "Coupon not found" });
        }

        const updatedCoupon = await updateCouponByCode(code, updates);
        if (!updatedCoupon) {
          log.error({ code, updates }, "Failed to update coupon");
          return reply.status(500).send({ error: "Failed to update coupon" });
        }

        log.info({ code }, "Coupon updated successfully");
        return reply.status(200).send(updatedCoupon);
      } catch (error) {
        log.error({ err: error, code, updates }, "Error updating coupon");
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.delete("/coupons/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const existingCoupon = await getCouponById(id);
      if (!existingCoupon) {
        log.warn({ id }, "Coupon not found for deletion");
        return reply.status(404).send({ error: "Coupon not found" });
      }

      const result = await deleteCouponById(existingCoupon);

      if (!result) {
        log.error({ id }, "Failed to delete coupon");
        return reply.status(500).send({ error: "Failed to delete coupon" });
      }

      log.info({ id }, "Coupon deleted successfully");

      return reply.status(204).send();
    } catch (error) {
      log.error({ err: error, id }, "Error deleting coupon");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.delete("/coupons/code/:code", async (request, reply) => {
    const { code } = request.params as { code: string };

    try {
      const existingCoupon = await getCouponByCode(code);
      if (!existingCoupon) {
        log.warn({ code }, "Coupon not found for deletion");
        return reply.status(404).send({ error: "Coupon not found" });
      }

      const result = await deleteCouponByCode(existingCoupon);

      if (!result) {
        log.error({ code }, "Failed to delete coupon");
        return reply.status(500).send({ error: "Failed to delete coupon" });
      }

      log.info({ code }, "Coupon deleted successfully");

      return reply.status(204).send();
    } catch (error) {
      log.error({ err: error, code }, "Error deleting coupon");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  done();
}
