import fastifyCors, { type FastifyCorsOptions } from "@fastify/cors";
import config from "~/config.js";

export const autoConfig: FastifyCorsOptions = {
  credentials: true,
  maxAge: 86400,
  origin: config.ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export default fastifyCors;
