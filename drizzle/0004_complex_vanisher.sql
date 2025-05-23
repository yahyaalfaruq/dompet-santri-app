ALTER TABLE "users_sample" ALTER COLUMN "display_name" SET DEFAULT 'Anonymous';--> statement-breakpoint
ALTER TABLE "users_sample" ALTER COLUMN "display_name" DROP NOT NULL;