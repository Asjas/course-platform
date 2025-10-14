import fastifyMultipart, {
  type FastifyMultipartAttachFieldsToBodyOptions,
} from "@fastify/multipart";
import { ONE_MB } from "~/lib/constants.js";

export const autoConfig: FastifyMultipartAttachFieldsToBodyOptions = {
  attachFieldsToBody: true,
  limits: {
    fileSize: ONE_MB,
  },
};

export default fastifyMultipart;
