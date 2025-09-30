INSERT INTO "my_schema"."user" (id, name, username, email, email_verified)
VALUES ('ghost', 'Ghost', 'ghost', 'ghost@codewizard.training', true)
ON CONFLICT (id) DO NOTHING;
