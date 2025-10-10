const routeBuckets = new Map<string, string>([
  ["/api/metrics", "metrics"],
  ["/api/auth", "auth_api"],
  ["/api/coupons", "coupons_api"],
  ["/api/courses", "courses_api"],
  ["/api/orders", "orders_api"],
  ["/api/users", "users_api"],
  ["/api/sessions", "sessions_api"],
  ["/api/support-tickets", "support_tickets_api"],
  ["/api/team-licenses", "team_licenses_api"],
  ["/api/platform-announcements", "platform_announcements_api"],
]);

// Normalize routes to avoid high cardinality
export function normalizeRoute(routeUrl: string | undefined): string {
  if (!routeUrl) return "unknown_api";

  // Replace route parameters
  const normalizedRoute = routeUrl
    .replace(/:\w+/g, "*") // Handle :param
    .replace(/\/\d+/g, "/*"); // Handle /123

  // Check for direct match (e.g., /api/users/* or /api/metrics)
  if (routeBuckets.has(normalizedRoute)) {
    return routeBuckets.get(normalizedRoute) || "unknown_api";
  }

  // Try the base route by removing trailing /* if present
  const baseRoute = normalizedRoute.endsWith("/*")
    ? normalizedRoute.slice(0, -2)
    : normalizedRoute;

  if (routeBuckets.has(baseRoute)) {
    return routeBuckets.get(baseRoute) || "unknown_api";
  }

  // Fallback to normalized route
  return normalizedRoute;
}
