ALTER TABLE "my_schema"."user" DROP COLUMN IF EXISTS "image";
ALTER TABLE "my_schema"."user" ADD COLUMN "image" bytea;
