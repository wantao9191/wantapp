ALTER TABLE "person_info" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "person_info" ADD COLUMN "latitude" real;--> statement-breakpoint
ALTER TABLE "person_info" ADD COLUMN "longitude" real;