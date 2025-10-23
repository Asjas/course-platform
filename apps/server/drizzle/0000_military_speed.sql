CREATE SCHEMA "my_schema";
--> statement-breakpoint
CREATE TYPE "my_schema"."discountType" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "my_schema"."course_access" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TYPE "my_schema"."course_level" AS ENUM('All levels', 'Beginner', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "my_schema"."video_provider" AS ENUM('youtube');--> statement-breakpoint
CREATE TYPE "my_schema"."course_enrollment_source" AS ENUM('direct', 'gift', 'team_invite');--> statement-breakpoint
CREATE TYPE "my_schema"."course_enrollment_status" AS ENUM('active', 'cancelled', 'refunded', 'completed');--> statement-breakpoint
CREATE TYPE "my_schema"."course_enrollment_type" AS ENUM('individual', 'gift', 'team');--> statement-breakpoint
CREATE TYPE "my_schema"."members" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "my_schema"."paid_status" AS ENUM('paid', 'refunded');--> statement-breakpoint
CREATE TYPE "my_schema"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "my_schema"."purchase_type" AS ENUM('individual', 'team');--> statement-breakpoint
CREATE TYPE "my_schema"."support_ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "my_schema"."support_ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "my_schema"."seat_status" AS ENUM('pending', 'claimed', 'revoked');--> statement-breakpoint
CREATE TYPE "my_schema"."announcement_id_type" AS ENUM('platform_update', 'platform_warning', 'course_update', 'new_course', 'general', 'warning');--> statement-breakpoint
CREATE TABLE "my_schema"."coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "my_schema"."discountType" DEFAULT 'percentage' NOT NULL,
	"discount_value" smallint NOT NULL,
	"redemption_limit" smallint DEFAULT 1 NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text DEFAULT 'ghost',
	"course_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_code_unique" UNIQUE("code"),
	CONSTRAINT "coupon_discount_value_check" CHECK ("my_schema"."coupon"."discount_value" > 0),
	CONSTRAINT "coupon_validity_check" CHECK ("my_schema"."coupon"."valid_until" IS NULL OR "my_schema"."coupon"."valid_until" > "my_schema"."coupon"."valid_from"),
	CONSTRAINT "coupon_discount_type_check" CHECK ("my_schema"."coupon"."discount_type" IN ('percentage', 'fixed')),
	CONSTRAINT "coupon_active_check" CHECK ("my_schema"."coupon"."active" IN (true, false)),
	CONSTRAINT "coupon_redemption_limit_check" CHECK ("my_schema"."coupon"."redemption_limit" > 0),
	CONSTRAINT "coupon_percentage_discount_check" CHECK (("my_schema"."coupon"."discount_type" != 'percentage') OR ("my_schema"."coupon"."discount_type" = 'percentage' AND "my_schema"."coupon"."discount_value" <= 100))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."coupon_redemption" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"level" "my_schema"."course_level" DEFAULT 'All levels',
	"thumbnail_url" text,
	"published" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"price" smallint DEFAULT 19 NOT NULL,
	"price_currency" text DEFAULT 'USD' NOT NULL,
	"is_sale_active" boolean DEFAULT false NOT NULL,
	"sale_price" smallint DEFAULT 0 NOT NULL,
	"sale_start_at" timestamp with time zone,
	"sale_expires_at" timestamp with time zone,
	"total_enrollments" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(2, 1) DEFAULT '0.0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"total_modules" integer DEFAULT 0 NOT NULL,
	"total_lessons" integer DEFAULT 0 NOT NULL,
	"total_duration" integer DEFAULT 0 NOT NULL,
	"trial_module_limit" smallint DEFAULT 0 NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_price_non_negative" CHECK ("my_schema"."course"."price" >= 0),
	CONSTRAINT "course_sale_price_non_negative" CHECK ("my_schema"."course"."sale_price" >= 0),
	CONSTRAINT "course_sale_price_not_greater" CHECK ("my_schema"."course"."sale_price" <= "my_schema"."course"."price"),
	CONSTRAINT "course_sale_dates_check" CHECK ("my_schema"."course"."sale_start_at" IS NULL OR "my_schema"."course"."sale_expires_at" IS NULL OR "my_schema"."course"."sale_expires_at" > "my_schema"."course"."sale_start_at"),
	CONSTRAINT "course_total_enrollments_check" CHECK ("my_schema"."course"."total_enrollments" >= 0),
	CONSTRAINT "course_average_rating_check" CHECK ("my_schema"."course"."average_rating" >= 0),
	CONSTRAINT "course_average_rating_max_check" CHECK ("my_schema"."course"."average_rating" <= 5),
	CONSTRAINT "course_total_reviews_check" CHECK ("my_schema"."course"."total_reviews" >= 0),
	CONSTRAINT "course_total_modules_check" CHECK ("my_schema"."course"."total_modules" >= 0),
	CONSTRAINT "course_total_lessons_check" CHECK ("my_schema"."course"."total_lessons" >= 0),
	CONSTRAINT "course_total_duration_check" CHECK ("my_schema"."course"."total_duration" >= 0),
	CONSTRAINT "course_trial_module_limit_check" CHECK ("my_schema"."course"."trial_module_limit" >= 0),
	CONSTRAINT "course_trial_module_limit_max_check" CHECK ("my_schema"."course"."trial_module_limit" <= "my_schema"."course"."total_modules")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_completion_certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"certificate_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_certificate_url_check" CHECK ("my_schema"."course_completion_certificate"."certificate_url" <> '')
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_faq" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"order" integer NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_faq_question_check" CHECK ("my_schema"."course_faq"."question" <> ''),
	CONSTRAINT "course_faq_answer_check" CHECK ("my_schema"."course_faq"."answer" <> ''),
	CONSTRAINT "course_faq_order_check" CHECK ("my_schema"."course_faq"."order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_instructor_note" (
	"id" text PRIMARY KEY NOT NULL,
	"note" text NOT NULL,
	"instructor_id" text NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_instructor_note_check" CHECK ("my_schema"."course_instructor_note"."note" <> '')
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"video_url" text NOT NULL,
	"video_provider" "my_schema"."video_provider" DEFAULT 'youtube' NOT NULL,
	"content" jsonb NOT NULL,
	"transcription" jsonb NOT NULL,
	"duration" integer,
	"order" integer NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"course_id" text NOT NULL,
	"module_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_module" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_module_order_check" CHECK ("my_schema"."course_module"."order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_review" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"rating" smallint NOT NULL,
	"title" text NOT NULL,
	"comment" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_review_rating_check" CHECK ("my_schema"."course_review"."rating" >= 1 AND "my_schema"."course_review"."rating" <= 5),
	CONSTRAINT "course_review_approval_check" CHECK ("my_schema"."course_review"."approved" IN (true, false)),
	CONSTRAINT "course_review_reviewed_at_check" CHECK ("my_schema"."course_review"."approved" = true OR ("my_schema"."course_review"."approved" = false AND "my_schema"."course_review"."reviewed_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_wishlist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_type" "my_schema"."course_enrollment_type" DEFAULT 'individual' NOT NULL,
	"enrollment_source" "my_schema"."course_enrollment_source" DEFAULT 'direct' NOT NULL,
	"status" "my_schema"."course_enrollment_status" DEFAULT 'active' NOT NULL,
	"gifted_by_user_id" text DEFAULT 'ghost',
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"payment_id" text,
	"invoice_id" text,
	"team_license_id" text,
	"team_invite_id" text,
	"gifted_at" timestamp with time zone,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enrollment_status_check" CHECK ("my_schema"."enrollment"."status" IN ('active', 'cancelled', 'refunded', 'completed')),
	CONSTRAINT "enrollment_gifted_at_check" CHECK ("my_schema"."enrollment"."enrollment_type" = 'gift' OR ("my_schema"."enrollment"."enrollment_type" != 'gift' AND "my_schema"."enrollment"."gifted_at" IS NULL)),
	CONSTRAINT "enrollment_payment_invoice_check" CHECK ("my_schema"."enrollment"."enrollment_type" = 'individual' OR ("my_schema"."enrollment"."enrollment_type" != 'individual' AND "my_schema"."enrollment"."payment_id" IS NULL AND "my_schema"."enrollment"."invoice_id" IS NULL)),
	CONSTRAINT "enrollment_team_license_check" CHECK ("my_schema"."enrollment"."enrollment_type" = 'team' OR ("my_schema"."enrollment"."enrollment_type" != 'team' AND "my_schema"."enrollment"."team_license_id" IS NULL AND "my_schema"."enrollment"."team_invite_id" IS NULL)),
	CONSTRAINT "enrollment_enrolled_at_check" CHECK ("my_schema"."enrollment"."enrolled_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "my_schema"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "my_schema"."members" DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"inviter_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."member" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "my_schema"."members" DEFAULT 'member' NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"impersonated_by" text,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"username" text,
	"display_username" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" "bytea",
	"role" "my_schema"."members" DEFAULT 'member' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "my_schema"."invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"billing_address" jsonb NOT NULL,
	"amount" smallint NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_coupon_applied" boolean DEFAULT false NOT NULL,
	"discount_amount" smallint DEFAULT 0 NOT NULL,
	"tax_rate" smallint DEFAULT 0 NOT NULL,
	"tax_amount" smallint DEFAULT 0 NOT NULL,
	"total_amount" smallint NOT NULL,
	"refunded_amount" smallint,
	"status" "my_schema"."paid_status" DEFAULT 'paid' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"payment_id" text,
	"coupon_id" text,
	"user_id" text DEFAULT 'ghost',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_invoiceNumber_unique" UNIQUE("invoice_number"),
	CONSTRAINT "invoice_amount_check" CHECK ("my_schema"."invoice"."amount" > 0),
	CONSTRAINT "invoice_discount_amount_check" CHECK ("my_schema"."invoice"."discount_amount" >= 0),
	CONSTRAINT "invoice_tax_rate_check" CHECK ("my_schema"."invoice"."tax_rate" >= 0),
	CONSTRAINT "invoice_tax_amount_check" CHECK ("my_schema"."invoice"."tax_amount" >= 0),
	CONSTRAINT "invoice_total_amount_check" CHECK ("my_schema"."invoice"."total_amount" > 0),
	CONSTRAINT "invoice_total_amount_consistency_check" CHECK ("my_schema"."invoice"."total_amount" = "my_schema"."invoice"."amount" - "my_schema"."invoice"."discount_amount" + "my_schema"."invoice"."tax_amount"),
	CONSTRAINT "invoice_status_check" CHECK ("my_schema"."invoice"."status" IN ('paid', 'refunded')),
	CONSTRAINT "invoice_paid_at_check" CHECK ("my_schema"."invoice"."status" = 'paid' OR ("my_schema"."invoice"."status" = 'refunded' AND "my_schema"."invoice"."paid_at" IS NOT NULL)),
	CONSTRAINT "invoice_refunded_at_check" CHECK ("my_schema"."invoice"."status" = 'refunded' OR ("my_schema"."invoice"."status" = 'paid' AND "my_schema"."invoice"."refunded_at" IS NULL)),
	CONSTRAINT "invoice_issued_at_check" CHECK ("my_schema"."invoice"."paid_at" IS NULL OR "my_schema"."invoice"."issued_at" <= "my_schema"."invoice"."paid_at"),
	CONSTRAINT "invoice_refunded_date_check" CHECK ("my_schema"."invoice"."refunded_at" IS NULL OR "my_schema"."invoice"."refunded_at" >= "my_schema"."invoice"."paid_at")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."payment" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" smallint NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_provider" text NOT NULL,
	"transaction_id" text NOT NULL,
	"status" "my_schema"."payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"purchase_type" "my_schema"."purchase_type" DEFAULT 'individual' NOT NULL,
	"bulk_quantity" smallint,
	"is_coupon_applied" boolean DEFAULT false NOT NULL,
	"discount_amount" smallint DEFAULT 0 NOT NULL,
	"is_gift" boolean DEFAULT false NOT NULL,
	"gift_recipient_email" text,
	"gift_message" text,
	"gift_redeem_token" text,
	"gift_redeem_url" text,
	"gift_redeemed_at" timestamp with time zone,
	"gift_expires_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"coupon_id" text,
	"gift_recipient_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactionId_unique" UNIQUE("transaction_id"),
	CONSTRAINT "payment_amount_check" CHECK ("my_schema"."payment"."amount" > 0),
	CONSTRAINT "payment_purchase_type_check" CHECK ("my_schema"."payment"."purchase_type" IN ('individual', 'team')),
	CONSTRAINT "payment_bulk_quantity_required_check" CHECK ((
        "my_schema"."payment"."purchase_type" = 'team'
        AND "my_schema"."payment"."bulk_quantity" IN (10, 15, 20, 25, 30, 35, 40)
      ) OR (
        "my_schema"."payment"."purchase_type" <> 'team'
        AND "my_schema"."payment"."bulk_quantity" IS NULL
      )),
	CONSTRAINT "payment_team_gift_mutual_exclusion_check" CHECK (("my_schema"."payment"."purchase_type" <> 'team') OR (NOT "my_schema"."payment"."is_gift")),
	CONSTRAINT "payment_gift_email_required_check" CHECK (("my_schema"."payment"."is_gift" = false AND "my_schema"."payment"."gift_recipient_email" IS NULL)
        OR ("my_schema"."payment"."is_gift" = true AND "my_schema"."payment"."gift_recipient_email" IS NOT NULL)),
	CONSTRAINT "payment_gift_redeem_token_check" CHECK (("my_schema"."payment"."is_gift" = false AND "my_schema"."payment"."gift_redeem_token" IS NULL)
        OR ("my_schema"."payment"."is_gift" = true AND "my_schema"."payment"."gift_redeem_token" IS NOT NULL)),
	CONSTRAINT "payment_gift_redeem_url_check" CHECK (("my_schema"."payment"."is_gift" = false AND "my_schema"."payment"."gift_redeem_url" IS NULL)
        OR ("my_schema"."payment"."is_gift" = true AND "my_schema"."payment"."gift_redeem_url" IS NOT NULL)),
	CONSTRAINT "payment_gift_redeem_date_check" CHECK ("my_schema"."payment"."gift_redeemed_at" IS NULL OR "my_schema"."payment"."gift_redeemed_at" <= "my_schema"."payment"."gift_expires_at"),
	CONSTRAINT "payment_discount_amount_check" CHECK ("my_schema"."payment"."discount_amount" >= 0),
	CONSTRAINT "payment_paid_at_check" CHECK ("my_schema"."payment"."status" = 'completed' OR "my_schema"."payment"."paid_at" IS NULL),
	CONSTRAINT "payment_status_check" CHECK ("my_schema"."payment"."status" IN ('pending', 'completed', 'failed', 'refunded'))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."support_ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"repo" text,
	"status" "my_schema"."support_ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "my_schema"."support_ticket_priority" DEFAULT 'medium' NOT NULL,
	"course_id" text,
	"module_id" text,
	"lesson_id" text,
	"user_id" text DEFAULT 'ghost' NOT NULL,
	"assigned_to_user_id" text DEFAULT 'ghost',
	"assigned_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_ticket_status_check" CHECK ("my_schema"."support_ticket"."status" IN ('open', 'in_progress', 'resolved', 'closed')),
	CONSTRAINT "support_ticket_priority_check" CHECK ("my_schema"."support_ticket"."priority" IN ('low', 'medium', 'high', 'urgent')),
	CONSTRAINT "support_ticket_resolution_check" CHECK (("my_schema"."support_ticket"."status" = 'resolved' AND "my_schema"."support_ticket"."resolved_at" IS NOT NULL) OR ("my_schema"."support_ticket"."status" != 'resolved' AND "my_schema"."support_ticket"."resolved_at" IS NULL)),
	CONSTRAINT "support_ticket_closure_check" CHECK (("my_schema"."support_ticket"."status" = 'closed' AND "my_schema"."support_ticket"."closed_at" IS NOT NULL) OR ("my_schema"."support_ticket"."status" != 'closed' AND "my_schema"."support_ticket"."closed_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."support_ticket_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"file_size" smallint,
	"user_id" text DEFAULT 'ghost' NOT NULL,
	"ticket_id" text NOT NULL,
	"comment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_ticket_attachment_file_url_check" CHECK ("my_schema"."support_ticket_attachment"."file_url" <> ''),
	CONSTRAINT "support_ticket_attachment_file_size_check" CHECK ("my_schema"."support_ticket_attachment"."file_size" IS NULL OR "my_schema"."support_ticket_attachment"."file_size" > 0),
	CONSTRAINT "support_ticket_attachment_file_type_check" CHECK ("my_schema"."support_ticket_attachment"."file_type" IS NULL OR "my_schema"."support_ticket_attachment"."file_type" <> '')
);
--> statement-breakpoint
CREATE TABLE "my_schema"."support_ticket_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"attachments" text[],
	"user_id" text DEFAULT 'ghost' NOT NULL,
	"ticket_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_ticket_comment_check" CHECK ("my_schema"."support_ticket_comment"."comment" <> '')
);
--> statement-breakpoint
CREATE TABLE "my_schema"."team_license" (
	"id" text PRIMARY KEY NOT NULL,
	"total_seats" smallint NOT NULL,
	"claimed_seats" smallint DEFAULT 0 NOT NULL,
	"course_id" text NOT NULL,
	"purchaser_id" text DEFAULT 'ghost' NOT NULL,
	"organization_id" text,
	"invoice_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_license_total_seats_check" CHECK ("my_schema"."team_license"."total_seats" IN (10, 15, 20, 25, 30)),
	CONSTRAINT "team_license_claimed_seats_check" CHECK ("my_schema"."team_license"."claimed_seats" >= 0 AND "my_schema"."team_license"."claimed_seats" <= "my_schema"."team_license"."total_seats")
);
--> statement-breakpoint
CREATE TABLE "my_schema"."team_license_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "my_schema"."seat_status" DEFAULT 'pending' NOT NULL,
	"license_id" text NOT NULL,
	"invite_email" text NOT NULL,
	"invite_code" text NOT NULL,
	"invited_by_user_id" text DEFAULT 'ghost' NOT NULL,
	"accepted_by_user_id" text,
	"revoked_by_user_id" text DEFAULT 'ghost',
	"expires_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_license_invite_inviteCode_unique" UNIQUE("invite_code"),
	CONSTRAINT "team_license_invite_status_check" CHECK ("my_schema"."team_license_invite"."status" IN ('pending', 'claimed', 'revoked')),
	CONSTRAINT "team_license_invite_acceptance_check" CHECK (("my_schema"."team_license_invite"."status" = 'claimed' AND "my_schema"."team_license_invite"."accepted_by_user_id" IS NOT NULL)
        OR ("my_schema"."team_license_invite"."status" <> 'claimed' AND "my_schema"."team_license_invite"."accepted_by_user_id" IS NULL)),
	CONSTRAINT "team_license_invite_revocation_check" CHECK (("my_schema"."team_license_invite"."status" = 'revoked' AND "my_schema"."team_license_invite"."revoked_by_user_id" IS NOT NULL AND "my_schema"."team_license_invite"."revoked_at" IS NOT NULL)
        OR ("my_schema"."team_license_invite"."status" <> 'revoked' AND "my_schema"."team_license_invite"."revoked_by_user_id" IS NULL AND "my_schema"."team_license_invite"."revoked_at" IS NULL)),
	CONSTRAINT "team_license_invite_expires_at_check" CHECK ("my_schema"."team_license_invite"."expires_at" IS NULL OR "my_schema"."team_license_invite"."expires_at" > "my_schema"."team_license_invite"."created_at"),
	CONSTRAINT "team_license_invite_last_sent_at_check" CHECK ("my_schema"."team_license_invite"."last_sent_at" IS NULL OR "my_schema"."team_license_invite"."last_sent_at" >= "my_schema"."team_license_invite"."created_at"),
	CONSTRAINT "team_license_invite_invite_code_check" CHECK ("my_schema"."team_license_invite"."invite_code" <> '')
);
--> statement-breakpoint
CREATE TABLE "my_schema"."course_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"progress" smallint DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_progress_check" CHECK ("my_schema"."course_progress"."progress" >= 0 AND "my_schema"."course_progress"."progress" <= 100),
	CONSTRAINT "course_progress_completed_check" CHECK ("my_schema"."course_progress"."completed" IN (true, false)),
	CONSTRAINT "course_progress_consistency_check" CHECK (("my_schema"."course_progress"."completed" = true AND "my_schema"."course_progress"."progress" = 100) OR ("my_schema"."course_progress"."completed" = false AND "my_schema"."course_progress"."progress" < 100))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"percent_complete" smallint DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_percent_complete_check" CHECK ("my_schema"."lesson_progress"."percent_complete" >= 0 AND "my_schema"."lesson_progress"."percent_complete" <= 100),
	CONSTRAINT "lesson_progress_completed_check" CHECK ("my_schema"."lesson_progress"."completed" IN (true, false)),
	CONSTRAINT "lesson_progress_consistency_check" CHECK (("my_schema"."lesson_progress"."completed" = true AND "my_schema"."lesson_progress"."percent_complete" = 100) OR ("my_schema"."lesson_progress"."completed" = false AND "my_schema"."lesson_progress"."percent_complete" < 100))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."platform_announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "my_schema"."announcement_id_type" DEFAULT 'general' NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" text DEFAULT 'ghost',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_announcement_message_check" CHECK ("my_schema"."platform_announcement"."message" <> ''),
	CONSTRAINT "platform_announcement_title_check" CHECK ("my_schema"."platform_announcement"."title" <> ''),
	CONSTRAINT "platform_announcement_type_check" CHECK ("my_schema"."platform_announcement"."type" IN ('platform_update', 'platform_warning', 'course_update', 'new_course', 'general', 'warning'))
);
--> statement-breakpoint
CREATE TABLE "my_schema"."platform_announcement_read" (
	"id" text PRIMARY KEY NOT NULL,
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" ADD CONSTRAINT "coupon_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon" ADD CONSTRAINT "coupon_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "my_schema"."coupon"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."coupon_redemption" ADD CONSTRAINT "coupon_redemption_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course" ADD CONSTRAINT "course_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_completion_certificate" ADD CONSTRAINT "course_completion_certificate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_completion_certificate" ADD CONSTRAINT "course_completion_certificate_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_faq" ADD CONSTRAINT "course_faq_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_instructor_note" ADD CONSTRAINT "course_instructor_note_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_instructor_note" ADD CONSTRAINT "course_instructor_note_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_lesson" ADD CONSTRAINT "course_lesson_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_lesson" ADD CONSTRAINT "course_lesson_module_id_course_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "my_schema"."course_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_module" ADD CONSTRAINT "course_module_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_review" ADD CONSTRAINT "course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_review" ADD CONSTRAINT "course_review_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD CONSTRAINT "course_wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_wishlist" ADD CONSTRAINT "course_wishlist_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_gifted_by_user_id_user_id_fk" FOREIGN KEY ("gifted_by_user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "my_schema"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "my_schema"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_team_license_id_team_license_id_fk" FOREIGN KEY ("team_license_id") REFERENCES "my_schema"."team_license"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."enrollment" ADD CONSTRAINT "enrollment_team_invite_id_team_license_invite_id_fk" FOREIGN KEY ("team_invite_id") REFERENCES "my_schema"."team_license_invite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "my_schema"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "my_schema"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invoice" ADD CONSTRAINT "invoice_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "my_schema"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invoice" ADD CONSTRAINT "invoice_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "my_schema"."coupon"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."invoice" ADD CONSTRAINT "invoice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "my_schema"."coupon"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."payment" ADD CONSTRAINT "payment_gift_recipient_user_id_user_id_fk" FOREIGN KEY ("gift_recipient_user_id") REFERENCES "my_schema"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_module_id_course_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "my_schema"."course_module"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "my_schema"."course_lesson"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket" ADD CONSTRAINT "support_ticket_assigned_to_user_id_user_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_attachment" ADD CONSTRAINT "support_ticket_attachment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_attachment" ADD CONSTRAINT "support_ticket_attachment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "my_schema"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_attachment" ADD CONSTRAINT "support_ticket_attachment_comment_id_support_ticket_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "my_schema"."support_ticket_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_comment" ADD CONSTRAINT "support_ticket_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."support_ticket_comment" ADD CONSTRAINT "support_ticket_comment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "my_schema"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license" ADD CONSTRAINT "team_license_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license" ADD CONSTRAINT "team_license_purchaser_id_user_id_fk" FOREIGN KEY ("purchaser_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license" ADD CONSTRAINT "team_license_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "my_schema"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license" ADD CONSTRAINT "team_license_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "my_schema"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license" ADD CONSTRAINT "team_license_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "my_schema"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license_invite" ADD CONSTRAINT "team_license_invite_license_id_team_license_id_fk" FOREIGN KEY ("license_id") REFERENCES "my_schema"."team_license"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license_invite" ADD CONSTRAINT "team_license_invite_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license_invite" ADD CONSTRAINT "team_license_invite_accepted_by_user_id_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."team_license_invite" ADD CONSTRAINT "team_license_invite_revoked_by_user_id_user_id_fk" FOREIGN KEY ("revoked_by_user_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_progress" ADD CONSTRAINT "course_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."course_progress" ADD CONSTRAINT "course_progress_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "my_schema"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "my_schema"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement" ADD CONSTRAINT "platform_announcement_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "my_schema"."user"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" ADD CONSTRAINT "platform_announcement_read_announcement_id_platform_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "my_schema"."platform_announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "my_schema"."platform_announcement_read" ADD CONSTRAINT "platform_announcement_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "my_schema"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_code_idx" ON "my_schema"."coupon" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemption_unique_idx" ON "my_schema"."coupon_redemption" USING btree ("coupon_id","user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_certificate_unique_idx" ON "my_schema"."course_completion_certificate" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "course_certificate_user_idx" ON "my_schema"."course_completion_certificate" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_faq_course_idx" ON "my_schema"."course_faq" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_instructor_note_unique_idx" ON "my_schema"."course_instructor_note" USING btree ("instructor_id","course_id");--> statement-breakpoint
CREATE INDEX "course_instructor_note_instructor_idx" ON "my_schema"."course_instructor_note" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "course_instructor_note_course_idx" ON "my_schema"."course_instructor_note" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_lesson_module_idx" ON "my_schema"."course_lesson" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "course_lesson_course_idx" ON "my_schema"."course_lesson" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_module_slug" ON "my_schema"."course_module" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "course_module_course_idx" ON "my_schema"."course_module" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_review_unique_idx" ON "my_schema"."course_review" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "course_review_user_idx" ON "my_schema"."course_review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_review_course_idx" ON "my_schema"."course_review" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_wishlist_email_idx" ON "my_schema"."course_wishlist" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "course_wishlist_unique_idx" ON "my_schema"."course_wishlist" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "course_wishlist_user_idx" ON "my_schema"."course_wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_wishlist_course_idx" ON "my_schema"."course_wishlist" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_unique_idx" ON "my_schema"."enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "enrollment_user_idx" ON "my_schema"."enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollment_course_idx" ON "my_schema"."enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "enrollment_payment_idx" ON "my_schema"."enrollment" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "enrollment_invoice_idx" ON "my_schema"."enrollment" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "enrollment_gifter_idx" ON "my_schema"."enrollment" USING btree ("gifted_by_user_id");--> statement-breakpoint
CREATE INDEX "enrollment_team_license_idx" ON "my_schema"."enrollment" USING btree ("team_license_id");--> statement-breakpoint
CREATE INDEX "enrollment_team_invite_idx" ON "my_schema"."enrollment" USING btree ("team_invite_id");--> statement-breakpoint
CREATE INDEX "enrollment_status_idx" ON "my_schema"."enrollment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "my_schema"."session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "my_schema"."user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_payment_unique_idx" ON "my_schema"."invoice" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "invoice_coupon_idx" ON "my_schema"."invoice" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "invoice_user_idx" ON "my_schema"."invoice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoice_invoice_number_idx" ON "my_schema"."invoice" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "payment_user_idx" ON "my_schema"."payment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_course_idx" ON "my_schema"."payment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "payment_coupon_idx" ON "my_schema"."payment" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "payment_gift_recipient_user_idx" ON "my_schema"."payment" USING btree ("gift_recipient_user_id");--> statement-breakpoint
CREATE INDEX "payment_purchase_type_idx" ON "my_schema"."payment" USING btree ("purchase_type");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_redeem_token_idx" ON "my_schema"."payment" USING btree ("gift_redeem_token");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_redeem_url_idx" ON "my_schema"."payment" USING btree ("gift_redeem_url");--> statement-breakpoint
CREATE INDEX "support_ticket_user_idx" ON "my_schema"."support_ticket" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_ticket_assigned_to_user_idx" ON "my_schema"."support_ticket" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "support_ticket_status_idx" ON "my_schema"."support_ticket" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_ticket_priority_idx" ON "my_schema"."support_ticket" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "support_ticket_course_idx" ON "my_schema"."support_ticket" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "support_ticket_lesson_idx" ON "my_schema"."support_ticket" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "support_ticket_attachment_user_idx" ON "my_schema"."support_ticket_attachment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_ticket_attachment_ticket_idx" ON "my_schema"."support_ticket_attachment" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "support_ticket_attachment_comment_idx" ON "my_schema"."support_ticket_attachment" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "support_ticket_comment_user_idx" ON "my_schema"."support_ticket_comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_ticket_comment_ticket_idx" ON "my_schema"."support_ticket_comment" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "team_license_course_idx" ON "my_schema"."team_license" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "team_license_purchaser_idx" ON "my_schema"."team_license" USING btree ("purchaser_id");--> statement-breakpoint
CREATE INDEX "team_license_organization_idx" ON "my_schema"."team_license" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "team_license_payment_idx" ON "my_schema"."team_license" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "team_license_invite_license_idx" ON "my_schema"."team_license_invite" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "team_license_invite_email_idx" ON "my_schema"."team_license_invite" USING btree ("invite_email");--> statement-breakpoint
CREATE INDEX "team_license_invite_status_idx" ON "my_schema"."team_license_invite" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "course_progress_unique_idx" ON "my_schema"."course_progress" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "course_progress_user_idx" ON "my_schema"."course_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_progress_course_idx" ON "my_schema"."course_progress" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_unique_idx" ON "my_schema"."lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_user_idx" ON "my_schema"."lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_lesson_idx" ON "my_schema"."lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "platform_announcement_author_idx" ON "my_schema"."platform_announcement" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_announcement_read_unique_idx" ON "my_schema"."platform_announcement_read" USING btree ("announcement_id","user_id");--> statement-breakpoint
CREATE INDEX "platform_announcement_read_announcement_idx" ON "my_schema"."platform_announcement_read" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "platform_announcement_read_user_idx" ON "my_schema"."platform_announcement_read" USING btree ("user_id");