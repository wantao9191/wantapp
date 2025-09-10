ALTER TABLE "person_info" RENAME COLUMN "code" TO "package_id";--> statement-breakpoint
ALTER TABLE "person_info" DROP CONSTRAINT "person_info_code_unique";--> statement-breakpoint
ALTER TABLE "person_info" ADD CONSTRAINT "person_info_package_id_care_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."care_packages"("id") ON DELETE no action ON UPDATE no action;