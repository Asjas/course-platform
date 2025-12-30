import * as z from "zod";
import config from "~/config.js";
import {
  externalServiceCount,
  externalServiceDuration,
  externalServiceErrors,
} from "~/lib/external-metrics.js";
import { publicProcedure, router } from "~/router.js";

const GIPHY_API_BASE = "https://api.giphy.com/v1/gifs";

export interface GiphyGif {
  id: string;
  images: {
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface GiphyResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

async function fetchGiphy(
  endpoint: string,
  params: Record<string, string | number>,
): Promise<GiphyResponse> {
  const url = new URL(`${GIPHY_API_BASE}/${endpoint}`);
  url.searchParams.set("api_key", config.GIPHY_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Giphy API error: ${response.status} ${response.statusText}. URL: ${url.toString().replace(config.GIPHY_API_KEY, "***")}. Response: ${responseText.slice(0, 200)}`,
    );
  }

  return response.json() as Promise<GiphyResponse>;
}

export const giphyRouter = router({
  trending: publicProcedure
    .input(
      z.object({
        offset: z.number().default(0),
        limit: z.number().default(10),
        rating: z.enum(["g", "pg", "pg-13", "r"]).default("pg-13"),
      }),
    )
    .query(async ({ input }) => {
      const start = process.hrtime.bigint();

      try {
        const data = await fetchGiphy("trending", {
          offset: input.offset,
          limit: input.limit,
          rating: input.rating,
        });

        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        externalServiceDuration.observe(
          { service: "giphy", operation: "trending" },
          duration,
        );
        externalServiceCount.inc({
          service: "giphy",
          operation: "trending",
          status: "success",
        });

        return data;
      } catch (error) {
        externalServiceCount.inc({
          service: "giphy",
          operation: "trending",
          status: "error",
        });
        externalServiceErrors.inc({
          service: "giphy",
          operation: "trending",
          error_type: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        offset: z.number().default(0),
        limit: z.number().default(10),
        rating: z.enum(["g", "pg", "pg-13", "r"]).default("pg-13"),
      }),
    )
    .query(async ({ input }) => {
      const start = process.hrtime.bigint();

      try {
        const data = await fetchGiphy("search", {
          q: input.query,
          offset: input.offset,
          limit: input.limit,
          rating: input.rating,
        });

        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        externalServiceDuration.observe(
          { service: "giphy", operation: "search" },
          duration,
        );
        externalServiceCount.inc({
          service: "giphy",
          operation: "search",
          status: "success",
        });

        return data;
      } catch (error) {
        externalServiceCount.inc({
          service: "giphy",
          operation: "search",
          status: "error",
        });
        externalServiceErrors.inc({
          service: "giphy",
          operation: "search",
          error_type: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    }),
});
