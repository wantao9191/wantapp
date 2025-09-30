ALTER TABLE "care_records" DROP CONSTRAINT "care_records_nurse_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "care_records" DROP CONSTRAINT "care_records_person_id_person_info_id_fk";
--> statement-breakpoint
ALTER TABLE "care_records" DROP CONSTRAINT "care_records_care_package_id_care_packages_id_fk";
--> statement-breakpoint
ALTER TABLE "care_records" DROP CONSTRAINT "care_records_care_task_id_care_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "care_records" ALTER COLUMN "status" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "care_records" ADD COLUMN "organization_id" integer;--> statement-breakpoint
ALTER TABLE "care_records" ADD COLUMN "alert_status" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "nurse_id";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "person_id";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "care_package_id";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "care_task_id";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "sign_in_status";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "sign_out_status";--> statement-breakpoint
ALTER TABLE "care_records" DROP COLUMN "tasks";