CREATE TYPE "public"."order_mode" AS ENUM('form', 'contact');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'paid', 'shipped');--> statement-breakpoint
CREATE TABLE "delivery_options" (
	"id" text PRIMARY KEY NOT NULL,
	"name_pl" text NOT NULL,
	"name_en" text NOT NULL,
	"description_pl" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"price_grosze" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"delivery_option_id" text,
	"delivery_name" text NOT NULL,
	"delivery_price_grosze" integer NOT NULL,
	"items" jsonb NOT NULL,
	"total_grosze" integer NOT NULL,
	"locale" text DEFAULT 'pl' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "payment_info" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"account_holder" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"transfer_title_hint_pl" text DEFAULT '' NOT NULL,
	"transfer_title_hint_en" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name_pl" text NOT NULL,
	"name_en" text NOT NULL,
	"description_pl" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"size" text DEFAULT '' NOT NULL,
	"price_grosze" integer NOT NULL,
	"image_url" text,
	"image_alt_pl" text DEFAULT '' NOT NULL,
	"image_alt_en" text DEFAULT '' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"apiary_name" text NOT NULL,
	"order_mode" "order_mode" DEFAULT 'contact' NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_tagline_pl" text DEFAULT '' NOT NULL,
	"hero_tagline_en" text DEFAULT '' NOT NULL,
	"about_story_pl" text DEFAULT '' NOT NULL,
	"about_story_en" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
