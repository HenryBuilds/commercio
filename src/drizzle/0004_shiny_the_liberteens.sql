CREATE TYPE "public"."pricing_strategy" AS ENUM('FIXED', 'TIERED');--> statement-breakpoint
CREATE TABLE "price_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_list_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_variant_id" uuid,
	"strategy" "pricing_strategy" DEFAULT 'FIXED' NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"tier_prices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"customer_group_id" uuid,
	"priority" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_entries" ADD CONSTRAINT "price_entries_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_entries" ADD CONSTRAINT "price_entries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_entries" ADD CONSTRAINT "price_entries_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_customer_group_id_customer_groups_id_fk" FOREIGN KEY ("customer_group_id") REFERENCES "public"."customer_groups"("id") ON DELETE set null ON UPDATE no action;