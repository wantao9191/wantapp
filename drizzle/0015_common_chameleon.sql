ALTER TABLE "schedule_plans" DROP CONSTRAINT "schedule_plans_code_unique";--> statement-breakpoint
ALTER TABLE "schedule_plans" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "schedule_plans" DROP COLUMN "code";