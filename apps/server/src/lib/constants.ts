// Time durations in seconds
export const TEN_SECONDS = 10;
export const FIFTEEN_SECONDS = 15;
export const THIRTY_SECONDS = 30;
export const ONE_MINUTE = 60;
export const TWO_MINUTES = 120;
export const FIVE_MINUTES = 300;
export const TEN_MINUTES = 600;
export const THIRTY_MINUTES = 1800;
export const ONE_HOUR = 3600;
export const ONE_DAY = 86_400;
export const ONE_WEEK = 604_800;
export const ONE_YEAR = 31_536_000;

// Data sizes in bytes
export const ONE_MB = 1_048_576;
export const FIVE_MB = 5_242_880;
export const TEN_MB = 10_485_760;

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
export function CACHE_PUBLIC_REVALIDATE({
  maxAge,
  cdnMaxAge,
  staleIfError = ONE_HOUR,
}: {
  maxAge: number;
  cdnMaxAge: number;
  staleIfError?: number;
}) {
  return {
    "Cache-Control": `public, max-age=${maxAge}, stale-if-error=${staleIfError}, must-revalidate`,
    "Cloudflare-CDN-Cache-Control": `public, max-age=${cdnMaxAge}, stale-if-error=${staleIfError}, must-revalidate`,
  };
}

// Private caching is useful for user-specific data that shouldn't be stored by shared caches
export function CACHE_PRIVATE_REVALIDATE({
  maxAge,
  staleIfError = ONE_HOUR,
}: {
  maxAge: number;
  staleIfError?: number;
}) {
  return {
    "Cache-Control": `private, max-age=${maxAge}, stale-if-error=${staleIfError}, must-revalidate`,
    "Vary": "Authorization",
  };
}
