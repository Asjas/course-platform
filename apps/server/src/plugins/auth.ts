import type {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from "fastify";
import fastifyPlugin from "fastify-plugin";

function authPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: HookHandlerDoneFunction,
) {
  fastify.decorateRequest("user", null);

  done();
}

export default fastifyPlugin(authPlugin);
