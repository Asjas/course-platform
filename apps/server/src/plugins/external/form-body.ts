import { FIVE_MB } from "../../lib/constants.ts";
import fastifyFormbody, {
  type FastifyFormbodyOptions,
} from "@fastify/formbody";

export const autoConfig: FastifyFormbodyOptions = { bodyLimit: FIVE_MB };

export default fastifyFormbody;
