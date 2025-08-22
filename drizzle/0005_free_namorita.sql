ALTER TABLE "menus" ADD COLUMN "parent_code" varchar(50);--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "parent_id";