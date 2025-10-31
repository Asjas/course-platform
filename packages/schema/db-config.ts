import * as z from "zod";

const schema = z.object({
  DATABASE_URL: z.url().regex(/^postgres:/, "Must be a PostgreSQL URL"),
});

export type Config = z.infer<typeof schema>;

console.log("process.env:", process.env);

export default schema.parse(process.env) as Config;
