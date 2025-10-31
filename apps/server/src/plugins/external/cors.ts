import config from "../../config.ts";
import fastifyCors, { type FastifyCorsOptions } from "@fastify/cors";

export const autoConfig: FastifyCorsOptions = {
  credentials: true,
  maxAge: 86400,
  origin: config.ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export default fastifyCors;
