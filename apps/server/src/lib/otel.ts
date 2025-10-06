import { FastifyOtelInstrumentation } from "@fastify/otel";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import config from "~/config.js";

const prometheusExporter = new PrometheusExporter({
  host: config.PROMETHEUS_HOST,
  port: config.PROMETHEUS_PORT,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    // This can also be set by OTEL_SERVICE_NAME
    // Instruments inherit from the SDK resource attributes
    [ATTR_SERVICE_NAME]: "course-platform",
  }),
  metricReader: prometheusExporter,
  instrumentations: [
    // HttpInstrumentation is required for FastifyOtelInstrumentation to work
    new HttpInstrumentation(),
    new FastifyOtelInstrumentation({
      // Automatically register the @fastify/otel fastify plugin for all routes
      registerOnInitialization: true,
    }),
  ],
});

sdk.start();

export { sdk };
