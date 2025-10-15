import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { createCouponHandler } from "~/routes/coupons/handlers/createCoupon.js";
import { deleteCouponByCodeHandler } from "~/routes/coupons/handlers/deleteCouponByCode.js";
import { deleteCouponByIdHandler } from "~/routes/coupons/handlers/deleteCouponById.js";
import { getCouponByCodeHandler } from "~/routes/coupons/handlers/getCouponByCode.js";
import { getCouponByIdHandler } from "~/routes/coupons/handlers/getCouponById.js";
import { getCouponsHandler } from "~/routes/coupons/handlers/getCoupons.js";
import { updateCouponByCodeHandler } from "~/routes/coupons/handlers/updateCouponByCode.js";
import { updateCouponByIdHandler } from "~/routes/coupons/handlers/updateCouponById.js";

export default function couponRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get("/coupons", getCouponsHandler);
  fastify.get("/coupons/:id", getCouponByIdHandler);
  fastify.get("/coupons/code/:code", getCouponByCodeHandler);
  fastify.post("/coupons", createCouponHandler);
  fastify.put("/coupons/:id", updateCouponByIdHandler);
  fastify.put("/coupons/code/:code", updateCouponByCodeHandler);
  fastify.delete("/coupons/:id", deleteCouponByIdHandler);
  fastify.delete("/coupons/code/:code", deleteCouponByCodeHandler);

  done();
}
