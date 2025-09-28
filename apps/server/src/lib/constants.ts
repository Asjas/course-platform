// Time durations in seconds
export const ONE_MINUTE = 60;
export const FIVE_MINUTES = 300;
export const TEN_MINUTES = 600;
export const THIRTY_MINUTES = 1800;
export const ONE_HOUR = 3600;
export const ONE_DAY = 86_400;

// No caching - useful for sensitive data that must not be stored
export const CACHE_NO_CACHE = {
  "Cache-Control": "no-cache",
};
export const CACHE_PRIVATE_NO_CACHE = {
  "Cache-Control": "private, no-cache",
};
export const CACHE_NO_STORE = {
  "Cache-Control":
    "no-cache, no-store, private, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

// Public caching is useful for assets that can be shared across users
export const CACHE_PUBLIC_1_MINUTE_REVALIDATE = {
  "Cache-Control": "public, max-age=60, stale-if-error=3600, must-revalidate",
};
export const CACHE_PUBLIC_5_MINUTES_REVALIDATE = {
  "Cache-Control": "public, max-age=300, stale-if-error=3600, must-revalidate",
};
export const CACHE_PUBLIC_10_MINUTES_REVALIDATE = {
  "Cache-Control": "public, max-age=600, stale-if-error=3600, must-revalidate",
};
export const CACHE_PUBLIC_30_MINUTES_REVALIDATE = {
  "Cache-Control": "public, max-age=1800, stale-if-error=3600, must-revalidate",
};
export const CACHE_PUBLIC_1_HOUR_REVALIDATE = {
  "Cache-Control": "public, max-age=3600, stale-if-error=3600, must-revalidate",
};
export const CACHE_PUBLIC_1_DAY_REVALIDATE = {
  "Cache-Control":
    "public, max-age=86_400, stale-if-error=3600, must-revalidate",
};

// Private caching is useful for user-specific data that shouldn't be stored by shared caches
export const CACHE_PRIVATE_1_MINUTE_REVALIDATE = {
  "Cache-Control": "private, max-age=60, stale-if-error=3600, must-revalidate",
};
export const CACHE_PRIVATE_5_MINUTES_REVALIDATE = {
  "Cache-Control": "private, max-age=300, stale-if-error=3600, must-revalidate",
};
export const CACHE_PRIVATE_10_MINUTES_REVALIDATE = {
  "Cache-Control": "private, max-age=600, stale-if-error=3600, must-revalidate",
};
export const CACHE_PRIVATE_30_MINUTES_REVALIDATE = {
  "Cache-Control":
    "private, max-age=1800, stale-if-error=3600, must-revalidate",
};
export const CACHE_PRIVATE_1_HOUR_REVALIDATE = {
  "Cache-Control":
    "private, max-age=3600, stale-if-error=3600, must-revalidate",
};
export const CACHE_PRIVATE_1_DAY_REVALIDATE = {
  "Cache-Control":
    "private, max-age=86_400, stale-if-error=3600, must-revalidate",
};
