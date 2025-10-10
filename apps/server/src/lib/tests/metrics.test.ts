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
    // Clear all registries before each test
    prometheus.register.clear();

    // Dynamically import to get fresh instances
    metrics = await import("../metrics.js");
  });

  afterEach(() => {
    // Clean up
    prometheus.register.clear();
  });

  describe("Registry Configuration", () => {
    test("should create a registry instance", () => {
      expect(metrics.registry).toBeInstanceOf(prometheus.Registry);
    });

    test("should set default labels with app name and instance", async () => {
      const metricsString = await metrics.registry.metrics();

      // Verify default labels appear in the metrics output
      expect(metricsString).toContain('app="course_platform"');
      expect(metricsString).toMatch(/instance="[^"]+:\d+"/); // hostname:pid format
    });

    test("should collect default metrics", async () => {
      const metricsString = await metrics.registry.metrics();

      // Check for common default metrics
      expect(metricsString).toContain("process_cpu_user_seconds_total");
      expect(metricsString).toContain("process_cpu_system_seconds_total");
      expect(metricsString).toContain("nodejs_heap_size_total_bytes");
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
          "# HELP nodejs_http_request_total Total number of HTTP requests",
        );
        expect(metricsString).toContain(
          "# TYPE nodejs_http_request_total counter",
        );
      });

      test("should have correct label names", async () => {
        // Increment with all expected labels
        metrics.httpRequestCount.inc({
          method: "GET",
          route: "users_api",
          status: "200",
        });

        const metricsString = await metrics.registry.metrics();

        // Verify all label names appear in the output
        expect(metricsString).toMatch(/method="[^"]+"/);
        expect(metricsString).toMatch(/route="[^"]+"/);
        expect(metricsString).toMatch(/status="[^"]+"/);

        // Verify the metric line contains all three labels
        expect(metricsString).toMatch(
          /nodejs_http_request_total\{[^}]*method="[^"]+"[^}]*route="[^"]+"[^}]*status="[^"]+"[^}]*\}/,
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
          "# HELP nodejs_http_request_duration_seconds HTTP request duration in seconds",
        );
        expect(metricsString).toContain(
          "# TYPE nodejs_http_request_duration_seconds histogram",
        );
      });

      test("should have correct label names", async () => {
        // Observe with all expected labels
        metrics.httpRequestDuration.observe(
          { method: "GET", route: "users_api", status: "200" },
          0.05,
        );

        const metricsString = await metrics.registry.metrics();

        // Verify all label names appear in the output
        expect(metricsString).toMatch(/method="[^"]+"/);
        expect(metricsString).toMatch(/route="[^"]+"/);
        expect(metricsString).toMatch(/status="[^"]+"/);

        // Verify the metric contains all three labels
        expect(metricsString).toMatch(
          /nodejs_http_request_duration_seconds_bucket\{[^}]*method="[^"]+"[^}]*route="[^"]+"[^}]*status="[^"]+"[^}]*\}/,
        );
      });

      test("should have correct buckets configuration", async () => {
        // Observe a value to generate buckets in output
        metrics.httpRequestDuration.observe(
          { method: "GET", route: "users_api", status: "200" },
          0.05,
        );

        const metricsString = await metrics.registry.metrics();

        // Verify bucket boundaries appear in the output
        const expectedBuckets = [
          0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30,
        ];

        for (const bucket of expectedBuckets) {
          expect(metricsString).toContain(`le="${bucket}"`);
        }

        // Verify +Inf bucket exists
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

        expect(metricsString).toContain("nodejs_http_request_duration_seconds");
        expect(metricsString).toContain('method="GET"');
        expect(metricsString).toContain('method="POST"');
      });
    });
  });

  describe("Database Connection Metrics", () => {
    describe("databaseConnectionsTotalGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.databaseConnectionsTotalGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP database_connections_total Total number of database connections in the pool",
        );
        expect(metricsString).toContain(
          "# TYPE database_connections_total gauge",
        );
      });

      test("should collect pool.totalCount value", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toMatch(/database_connections_total\{[^}]+\} 10/);
      });
    });

    describe("databaseConnectionsIdleGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.databaseConnectionsIdleGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP database_connections_idle Number of idle database connections in the pool",
        );
        expect(metricsString).toContain(
          "# TYPE database_connections_idle gauge",
        );
      });

      test("should collect pool.idleCount value", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toMatch(/database_connections_idle\{[^}]+\} 5/);
      });
    });

    describe("databaseConnectionsWaitingGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.databaseConnectionsWaitingGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP database_connections_waiting Number of queries waiting for a database connection",
        );
        expect(metricsString).toContain(
          "# TYPE database_connections_waiting gauge",
        );
      });

      test("should collect pool.waitingCount value", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toMatch(
          /database_connections_waiting\{[^}]+\} 2/,
        );
      });
    });

    describe("databaseConnectionsMaxGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.databaseConnectionsMaxGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP database_connections_max Maximum number of database connections allowed in the pool",
        );
        expect(metricsString).toContain(
          "# TYPE database_connections_max gauge",
        );
      });

      test("should collect pool.options.max value", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toMatch(/database_connections_max\{[^}]+\} 20/);
      });
    });

    describe("databaseConnectionsActiveGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.databaseConnectionsActiveGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP database_connections_active Number of active database connections in the pool",
        );
        expect(metricsString).toContain(
          "# TYPE database_connections_active gauge",
        );
      });

      test("should calculate active connections correctly (total - idle)", async () => {
        const metricsString = await metrics.registry.metrics();

        // Active = totalCount (10) - idleCount (5) = 5
        // The metric includes labels, so we need to match with a regex
        expect(metricsString).toMatch(/database_connections_active\{[^}]+\} 5/);
      });
    });
  });

  describe("Node.js Process Metrics", () => {
    describe("nodejsProcessMemoryGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.nodejsProcessMemoryGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP nodejs_process_memory_bytes Node.js process memory usage in bytes",
        );
        expect(metricsString).toContain(
          "# TYPE nodejs_process_memory_bytes gauge",
        );
      });

      test("should have 'type' label", async () => {
        const metricsString = await metrics.registry.metrics();

        // Verify the type label appears in the output
        expect(metricsString).toMatch(/type="[^"]+"/);

        // Verify metric lines contain the type label
        expect(metricsString).toMatch(
          /nodejs_process_memory_bytes\{[^}]*type="[^"]+"[^}]*\}/,
        );
      });

      test("should collect memory usage metrics", async () => {
        const metricsString = await metrics.registry.metrics();

        // Check for memory types from process.memoryUsage()
        expect(metricsString).toContain('type="rss"');
        expect(metricsString).toContain('type="heapTotal"');
        expect(metricsString).toContain('type="heapUsed"');
        expect(metricsString).toContain('type="external"');
        expect(metricsString).toContain('type="arrayBuffers"');
      });
    });

    describe("eventLoopUtilizationGauge", () => {
      test("should be a Gauge instance", () => {
        expect(metrics.eventLoopUtilizationGauge).toBeInstanceOf(
          prometheus.Gauge,
        );
      });

      test("should have correct name and help text in output", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "# HELP nodejs_event_loop_utilization_percent Node.js event loop utilization in percent",
        );
        expect(metricsString).toContain(
          "# TYPE nodejs_event_loop_utilization_percent gauge",
        );
      });

      test("should collect event loop utilization", async () => {
        const metricsString = await metrics.registry.metrics();

        expect(metricsString).toContain(
          "nodejs_event_loop_utilization_percent",
        );
        // Value should be a number (percentage between 0-100)
        // The metric includes labels, so we need to account for them
        expect(metricsString).toMatch(
          /nodejs_event_loop_utilization_percent\{[^}]+\} \d+\.?\d*/,
        );
      });
    });
  });

  describe("Metrics Export", () => {
    test("should export all metrics in Prometheus format", async () => {
      // Add some sample data
      metrics.httpRequestCount.inc({
        method: "GET",
        route: "users_api",
        status: "200",
      });
      metrics.httpRequestDuration.observe(
        { method: "GET", route: "users_api", status: "200" },
        0.123,
      );

      const metricsString = await metrics.registry.metrics();

      // Check that metrics are in Prometheus format
      expect(metricsString).toContain("# HELP");
      expect(metricsString).toContain("# TYPE");
      expect(metricsString).toContain("nodejs_http_request_total");
      expect(metricsString).toContain("nodejs_http_request_duration_seconds");
      expect(metricsString).toContain("database_connections_total");
      expect(metricsString).toContain("nodejs_process_memory_bytes");
      expect(metricsString).toContain("nodejs_event_loop_utilization_percent");
    });

    test("should include default labels in exported metrics", async () => {
      const metricsString = await metrics.registry.metrics();

      expect(metricsString).toContain('app="course_platform"');
      expect(metricsString).toMatch(/instance="[^"]+:\d+"/);
    });
  });

  describe("Metric Types", () => {
    test("httpRequestCount should be a counter type", async () => {
      const metricsString = await metrics.registry.metrics();

      expect(metricsString).toContain(
        "# TYPE nodejs_http_request_total counter",
      );
    });

    test("httpRequestDuration should be a histogram type", async () => {
      const metricsString = await metrics.registry.metrics();

      expect(metricsString).toContain(
        "# TYPE nodejs_http_request_duration_seconds histogram",
      );
    });

    test("database connection gauges should be gauge type", async () => {
      const metricsString = await metrics.registry.metrics();

      expect(metricsString).toContain(
        "# TYPE database_connections_total gauge",
      );
      expect(metricsString).toContain("# TYPE database_connections_idle gauge");
      expect(metricsString).toContain(
        "# TYPE database_connections_waiting gauge",
      );
      expect(metricsString).toContain("# TYPE database_connections_max gauge");
      expect(metricsString).toContain(
        "# TYPE database_connections_active gauge",
      );
    });
  });

  describe("Metrics Registration", () => {
    test("all custom metrics should be registered to the registry", () => {
      const metricNames = metrics.registry
        .getMetricsAsArray()
        .map((m) => m.name);

      expect(metricNames).toContain("nodejs_http_request_total");
      expect(metricNames).toContain("nodejs_http_request_duration_seconds");
      expect(metricNames).toContain("database_connections_total");
      expect(metricNames).toContain("database_connections_idle");
      expect(metricNames).toContain("database_connections_waiting");
      expect(metricNames).toContain("database_connections_max");
      expect(metricNames).toContain("database_connections_active");
      expect(metricNames).toContain("nodejs_process_memory_bytes");
      expect(metricNames).toContain("nodejs_event_loop_utilization_percent");
    });
  });
});
