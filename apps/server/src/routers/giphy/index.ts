import { GiphyFetch } from "@giphy/js-fetch-api";
import * as z from "zod";
import config from "~/config.js";
import {
  externalServiceCount,
  externalServiceDuration,
  externalServiceErrors,
} from "~/lib/external-metrics.js";
import { publicProcedure, router } from "~/router.js";

// Initialize Giphy SDK client
const giphyClient = new GiphyFetch(config.GIPHY_API_KEY);

// Using types from @giphy/js-fetch-api instead of custom interfaces
// The SDK returns GifsResult which contains IGif[] with proper types

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
        // Use official Giphy SDK to fetch trending GIFs
        const result = await giphyClient.trending({
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

        // Return the GifsResult from the SDK (contains data and pagination)
        return result;
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
        // Use official Giphy SDK to search for GIFs
        const result = await giphyClient.search(input.query, {
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

        // Return the GifsResult from the SDK (contains data and pagination)
        return result;
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
