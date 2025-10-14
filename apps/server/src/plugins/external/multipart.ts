import fastifyMultipart, {
  type FastifyMultipartAttachFieldsToBodyOptions,
} from "@fastify/multipart";

const FIVE_MB = 5 * 1024 * 1024;

export const autoConfig: FastifyMultipartAttachFieldsToBodyOptions = {
  attachFieldsToBody: true,
  limits: {
    fileSize: FIVE_MB,
  },
};

export default fastifyMultipart;
