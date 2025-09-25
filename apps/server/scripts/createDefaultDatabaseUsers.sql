INSERT INTO "user" (id, name, username, email)
VALUES ('ghost', 'Ghost', 'ghost', 'ghost@codewizard.training')
ON CONFLICT (id) DO NOTHING;
