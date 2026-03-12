CREATE TABLE "my_schema"."course_wishlist_verification_token" (
	"id" text PRIMARY KEY NOT NULL,
	"wishlist_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist_verification_token" ADD CONSTRAINT "course_wishlist_verification_token_wishlist_id_course_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "my_schema"."course_wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_wishlist_verification_token_hash_idx" ON "my_schema"."course_wishlist_verification_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "course_wishlist_verification_token_wishlist_idx" ON "my_schema"."course_wishlist_verification_token" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "course_wishlist_verification_token_expires_idx" ON "my_schema"."course_wishlist_verification_token" USING btree ("expires_at");