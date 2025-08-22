ALTER TABLE "roles" ALTER COLUMN "menus" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "permissions" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "path" varchar(200);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "icon" varchar(50);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "sort" integer DEFAULT 0;