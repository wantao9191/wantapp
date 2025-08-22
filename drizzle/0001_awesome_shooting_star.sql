CREATE TABLE "api_permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "api_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"path" varchar(200) NOT NULL,
	"method" varchar(10),
	"permission" varchar(100) NOT NULL,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dicts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dicts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"label" varchar(50) NOT NULL,
	"value" varchar(50) NOT NULL,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "phone" varchar(11);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "email" varchar(50);