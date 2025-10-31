import { ONE_MB } from "../../lib/constants.ts";
import fastifyMultipart, {
  type FastifyMultipartAttachFieldsToBodyOptions,
} from "@fastify/multipart";

export const autoConfig: FastifyMultipartAttachFieldsToBodyOptions = {
  attachFieldsToBody: true,
  limits: {
    fileSize: ONE_MB,
  },
};

export default fastifyMultipart;
