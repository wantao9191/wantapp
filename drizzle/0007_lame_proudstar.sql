CREATE TABLE "person_info" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "person_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"mobile" varchar(11) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"age" integer NOT NULL,
	"address" varchar(255) NOT NULL,
	"credential" varchar(50) NOT NULL,
	"avatar" integer,
	"organization_id" integer,
	"type" varchar(50) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "person_info_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "care_packages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "care_packages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"tasks" json,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "care_record_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "care_record_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"care_record_id" integer,
	"care_task_id" integer,
	"status" integer DEFAULT 1,
	"files" json,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "care_records" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "care_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nurse_id" integer,
	"person_id" integer,
	"care_package_id" integer,
	"care_task_id" integer,
	"schedule_plan_id" integer,
	"sign_in_time" timestamp,
	"sign_out_time" timestamp,
	"sign_in_status" integer DEFAULT 0,
	"sign_out_status" integer DEFAULT 0,
	"sign_in_location" varchar(255),
	"sign_out_location" varchar(255),
	"sign_in_photo" integer,
	"sign_out_photo" integer,
	"tasks" json,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "care_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "care_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"description" text,
	"cover" integer,
	"audio" integer,
	"min_duration" integer,
	"max_duration" integer,
	"level" varchar(50),
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "schedule_plans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schedule_plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"organization_id" integer,
	"nurse_id" integer,
	"insured_id" integer,
	"package_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false,
	CONSTRAINT "schedule_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"path" varchar(255) NOT NULL,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"deleted" boolean DEFAULT false,
	"create_by" integer
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(50);--> statement-breakpoint
ALTER TABLE "person_info" ADD CONSTRAINT "person_info_avatar_files_id_fk" FOREIGN KEY ("avatar") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_info" ADD CONSTRAINT "person_info_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_record_tasks" ADD CONSTRAINT "care_record_tasks_care_record_id_care_records_id_fk" FOREIGN KEY ("care_record_id") REFERENCES "public"."care_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_record_tasks" ADD CONSTRAINT "care_record_tasks_care_task_id_care_tasks_id_fk" FOREIGN KEY ("care_task_id") REFERENCES "public"."care_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_nurse_id_users_id_fk" FOREIGN KEY ("nurse_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_person_id_person_info_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person_info"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_care_package_id_care_packages_id_fk" FOREIGN KEY ("care_package_id") REFERENCES "public"."care_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_care_task_id_care_tasks_id_fk" FOREIGN KEY ("care_task_id") REFERENCES "public"."care_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_schedule_plan_id_schedule_plans_id_fk" FOREIGN KEY ("schedule_plan_id") REFERENCES "public"."schedule_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_plans" ADD CONSTRAINT "schedule_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_plans" ADD CONSTRAINT "schedule_plans_nurse_id_users_id_fk" FOREIGN KEY ("nurse_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_plans" ADD CONSTRAINT "schedule_plans_insured_id_person_info_id_fk" FOREIGN KEY ("insured_id") REFERENCES "public"."person_info"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_plans" ADD CONSTRAINT "schedule_plans_package_id_care_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."care_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_create_by_users_id_fk" FOREIGN KEY ("create_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;