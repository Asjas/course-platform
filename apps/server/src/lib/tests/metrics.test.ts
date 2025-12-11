import prometheus from "prom-client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock the database pool before importing metrics
vi.mock("~/db/index.js", () => ({
  pool: {
    totalCount: 10,
    idleCount: 5,
    waitingCount: 2,
    options: {
      max: 20,
    },
  },
}));

describe("Metrics Module", () => {
  let metrics: typeof import("../metrics.js");

  beforeEach(async () => {
    // Clear registry before each test
    prometheus.register.clear();

    // Fresh import to get clean module state
    metrics = await import("../metrics.js");
  });

  afterEach(() => {
    prometheus.register.clear();
  });

  describe("Registry Configuration", () => {
    test("should create a registry instance", () => {
      expect(metrics.registry).toBeInstanceOf(prometheus.Registry);
    });

    test("should set default labels with app name and instance", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain('app="course_platform"');
      expect(metricsString).toMatch(/instance="[^"]+:\d+"/);
    });
  });

  describe("HTTP Request Metrics", () => {
    describe("httpRequestCount", () => {
      test("should be a Counter instance", () => {
        expect(metrics.httpRequestCount).toBeInstanceOf(prometheus.Counter);
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();
        expect(metricsString).toContain(
          "# HELP course_platform_http_request_total Total number of HTTP requests",
        );
        expect(metricsString).toContain(
          "# TYPE course_platform_http_request_total counter",
        );
      });

      test("should have correct label names", async () => {
        metrics.httpRequestCount.inc({
          method: "GET",
          route: "users_api",
          status: "200",
        });

        const metricsString = await metrics.registry.metrics();
        expect(metricsString).toMatch(/method="GET"/);
        expect(metricsString).toMatch(/route="users_api"/);
        expect(metricsString).toMatch(/status="200"/);
        expect(metricsString).toMatch(
          /course_platform_http_request_total\{.*method="GET".*route="users_api".*status="200".*\}/,
        );
      });

      test("should increment counter with labels", async () => {
        metrics.httpRequestCount.inc({
          method: "GET",
          route: "users_api",
          status: "200",
        });
        metrics.httpRequestCount.inc({
          method: "POST",
          route: "courses_api",
          status: "201",
        });

        const metricsString = await metrics.registry.metrics();
        expect(metricsString).toContain('method="GET"');
        expect(metricsString).toContain('route="users_api"');
        expect(metricsString).toContain('status="200"');
        expect(metricsString).toContain('method="POST"');
        expect(metricsString).toContain('route="courses_api"');
        expect(metricsString).toContain('status="201"');
      });
    });

    describe("httpRequestDuration", () => {
      test("should be a Histogram instance", () => {
        expect(metrics.httpRequestDuration).toBeInstanceOf(
          prometheus.Histogram,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();
        expect(metricsString).toContain(
          "# HELP course_platform_http_request_duration_seconds HTTP request duration in seconds",
        );
        expect(metricsString).toContain(
          "# TYPE course_platform_http_request_duration_seconds histogram",
        );
      });

      test("should have correct buckets configuration", async () => {
        metrics.httpRequestDuration.observe(
          { method: "GET", route: "users_api", status: "200" },
          0.05,
        );

        const metricsString = await metrics.registry.metrics();
        const expectedBuckets = [
          0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30,
        ];
        for (const bucket of expectedBuckets) {
          expect(metricsString).toContain(`le="${bucket}"`);
        }
        expect(metricsString).toContain('le="+Inf"');
      });

      test("should observe duration values", async () => {
        metrics.httpRequestDuration.observe(
          { method: "GET", route: "users_api", status: "200" },
          0.05,
        );
        metrics.httpRequestDuration.observe(
          { method: "POST", route: "courses_api", status: "201" },
          0.15,
        );

        const metricsString = await metrics.registry.metrics();
        expect(metricsString).toContain(
          "course_platform_http_request_duration_seconds",
        );
        expect(metricsString).toContain('method="GET"');
        expect(metricsString).toContain('method="POST"');
      });
    });
  });

  describe("Database Connection Metrics", () => {
    const gauges = [
      {
        name: "databaseConnectionsTotalGauge",
        value: 10,
        expectedName: "course_platform_database_connections_total",
      },
      {
        name: "databaseConnectionsIdleGauge",
        value: 5,
        expectedName: "course_platform_database_connections_idle",
      },
      {
        name: "databaseConnectionsWaitingGauge",
        value: 2,
        expectedName: "course_platform_database_connections_waiting",
      },
      {
        name: "databaseConnectionsMaxGauge",
        value: 20,
        expectedName: "course_platform_database_connections_max",
      },
      {
        name: "databaseConnectionsActiveGauge",
        value: 5,
        expectedName: "course_platform_database_connections_active",
      },
    ] as const;

    for (const { name, value, expectedName } of gauges) {
      describe(name, () => {
        test("should be a Gauge instance", () => {
          expect(metrics[name]).toBeInstanceOf(prometheus.Gauge);
        });

        test("should have correct name and type", async () => {
          const metricsString = await metrics.registry.metrics();
          expect(metricsString).toContain(`# TYPE ${expectedName} gauge`);
        });

        test(`should report correct value (${value})`, async () => {
          const metricsString = await metrics.registry.metrics();
          expect(metricsString).toMatch(
            new RegExp(`${expectedName}\\{[^}]*\\} ${value}`),
          );
        });
      });
    }
  });

  describe("Node.js Process Metrics", () => {
    test("memoryUsageGauge should exist and have type label", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain("course_platform_process_memory_bytes");
      expect(metricsString).toContain('type="rss"');
      expect(metricsString).toContain('type="heapTotal"');
      expect(metricsString).toContain('type="heapUsed"');
    });

    test("eventLoopUtilizationGauge should exist", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain(
        "course_platform_eventloop_utilization_percent",
      );
    });
  });

  describe("Cache Metrics", () => {
    test("cache counters should be registered", () => {
      expect(metrics.cacheHitCounter).toBeInstanceOf(prometheus.Counter);
      expect(metrics.cacheMissCounter).toBeInstanceOf(prometheus.Counter);
      expect(metrics.cacheErrorCounter).toBeInstanceOf(prometheus.Counter);
    });
  });

  describe("Metrics Export", () => {
    test("should export all custom metrics in Prometheus format", async () => {
      metrics.httpRequestCount.inc({
        method: "GET",
        route: "/",
        status: "200",
      });
      metrics.httpRequestDuration.observe(
        { method: "GET", route: "/", status: "200" },
        0.1,
      );

      const metricsString = await metrics.registry.metrics();

      expect(metricsString).toContain(
        "# HELP course_platform_http_request_total",
      );
      expect(metricsString).toContain(
        "# TYPE course_platform_http_request_total counter",
      );
      expect(metricsString).toContain(
        "# HELP course_platform_http_request_duration_seconds",
      );
      expect(metricsString).toContain(
        "# TYPE course_platform_http_request_duration_seconds histogram",
      );
      expect(metricsString).toContain(
        "course_platform_database_connections_total",
      );
      expect(metricsString).toContain("course_platform_process_memory_bytes");
      expect(metricsString).toContain('app="course_platform"');
    });
  });

  describe("Metric Types", () => {
    test("httpRequestCount should be a counter type", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain(
        "# TYPE course_platform_http_request_total counter",
      );
    });

    test("httpRequestDuration should be a histogram type", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain(
        "# TYPE course_platform_http_request_duration_seconds histogram",
      );
    });

    test("database connection gauges should be gauge type", async () => {
      const metricsString = await metrics.registry.metrics();
      expect(metricsString).toContain(
        "course_platform_database_connections_total",
      );
      expect(metricsString).toContain(
        "course_platform_database_connections_idle",
      );
      expect(metricsString).toContain(
        "course_platform_database_connections_waiting",
      );
      expect(metricsString).toContain(
        "course_platform_database_connections_max",
      );
      expect(metricsString).toContain(
        "course_platform_database_connections_active",
      );
    });
  });

  describe("Metrics Registration", () => {
    test("all custom metrics should be registered to the registry", () => {
      const metricNames = metrics.registry
        .getMetricsAsArray()
        .map((m) => m.name);

      expect(metricNames).toContain("course_platform_http_request_total");
      expect(metricNames).toContain(
        "course_platform_http_request_duration_seconds",
      );
      expect(metricNames).toContain(
        "course_platform_database_connections_total",
      );
      expect(metricNames).toContain(
        "course_platform_database_connections_idle",
      );
      expect(metricNames).toContain(
        "course_platform_database_connections_waiting",
      );
      expect(metricNames).toContain("course_platform_database_connections_max");
      expect(metricNames).toContain(
        "course_platform_database_connections_active",
      );
      expect(metricNames).toContain("course_platform_process_memory_bytes");
      expect(metricNames).toContain(
        "course_platform_eventloop_utilization_percent",
      );
      expect(metricNames).toContain("course_platform_cache_hits_total");
      expect(metricNames).toContain("course_platform_cache_misses_total");
      expect(metricNames).toContain("course_platform_cache_errors_total");
    });
  });
});
