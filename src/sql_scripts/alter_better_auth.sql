-- Add a new column role to the "user" table
ALTER TABLE "user"
ADD COLUMN "role" text NOT NULL DEFAULT 'free';

-- Update the role of a specific user
UPDATE "user" SET "role" = 'premium' WHERE "email" = 'marv@example.com';