import { FastifyOtelInstrumentation } from "@fastify/otel";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import config from "~/config.js";

const prometheusExporter = new PrometheusExporter({
  host: config.PROMETHEUS_HOST,
  port: config.PROMETHEUS_PORT,
  endpoint: "/metrics",
  preventServerStart: false,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "course-platform",
  }),
  metricReaders: [prometheusExporter],
  instrumentations: [
    getNodeAutoInstrumentations(),
    new HttpInstrumentation(),
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
    }),
  ],
});

sdk.start();

export { sdk };
