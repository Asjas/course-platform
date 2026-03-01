import fastifyCors, { type FastifyCorsOptions } from "@fastify/cors";
import config from "~/config.js";

export const autoConfig: FastifyCorsOptions = {
  credentials: true,
  maxAge: 86400,
  origin: config.ORIGIN, // Supports multiple origins as array
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

export default fastifyCors;
