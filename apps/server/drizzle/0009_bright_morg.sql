DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_completed' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'payment_completed';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_refunded' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'payment_refunded';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_failed' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'payment_failed';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'coupon_redeemed' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'coupon_redeemed';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'coupon_expired' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'coupon_expired';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_license_purchased' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'team_license_purchased';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_license_invite_received' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'team_license_invite_received';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_license_invite_accepted' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'team_license_invite_accepted';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_license_invite_revoked' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'team_license_invite_revoked';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_license_seat_claimed' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'team_license_seat_claimed';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'course_published' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'course_published';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'certificate_issued' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'certificate_issued';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_ticket_assigned' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'support_ticket_assigned';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support_ticket_resolved' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'support_ticket_resolved';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_new_review' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_new_review';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_new_support_ticket' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_new_support_ticket';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_support_ticket_comment' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_support_ticket_comment';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_new_purchase' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_new_purchase';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_refund_requested' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_refund_requested';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_coupon_usage_threshold' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_coupon_usage_threshold';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_team_license_created' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_team_license_created';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_course_review_milestone' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_course_review_milestone';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_enrollment_milestone' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_enrollment_milestone';
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_new_user_registration' AND enumtypid = 'my_schema.user_notification_type'::regtype) THEN
    ALTER TYPE "my_schema"."user_notification_type" ADD VALUE 'admin_new_user_registration';
  END IF;
END $$;