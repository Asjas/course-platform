import fastifyFormbody, {
  type FastifyFormbodyOptions,
} from "@fastify/formbody";
import { FIVE_MB } from "~/lib/constants.js";

export const autoConfig: FastifyFormbodyOptions = { bodyLimit: FIVE_MB };

export default fastifyFormbody;
