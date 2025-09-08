ALTER TABLE "care_tasks" ADD COLUMN "coverId" integer;--> statement-breakpoint
ALTER TABLE "care_tasks" ADD COLUMN "audioId" integer;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "source_name" varchar(50);--> statement-breakpoint
ALTER TABLE "care_tasks" ADD CONSTRAINT "care_tasks_coverId_files_id_fk" FOREIGN KEY ("coverId") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_tasks" ADD CONSTRAINT "care_tasks_audioId_files_id_fk" FOREIGN KEY ("audioId") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_tasks" DROP COLUMN "cover";--> statement-breakpoint
ALTER TABLE "care_tasks" DROP COLUMN "audio";