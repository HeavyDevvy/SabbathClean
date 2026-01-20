CREATE TABLE "booking_gate_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"encrypted_gate_code" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text,
	"created_at" timestamp DEFAULT now(),
	"accessed_at" timestamp,
	"accessed_by" varchar,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" varchar,
	"service_id" varchar NOT NULL,
	"booking_reference" text,
	"booking_number" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time" text NOT NULL,
	"duration" integer NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) DEFAULT '0',
	"payment_processing_fee" numeric(10, 2) DEFAULT '0',
	"provider_payout" numeric(10, 2) DEFAULT '0',
	"tip_amount" numeric(10, 2) DEFAULT '0',
	"payment_status" text DEFAULT 'pending',
	"payment_intent_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"service_type" text NOT NULL,
	"service_details" jsonb,
	"customer_details" jsonb,
	"address" text NOT NULL,
	"city" text,
	"postal_code" text,
	"property_type" text,
	"property_size" text,
	"rooms" integer,
	"bathrooms" integer,
	"access_instructions" text,
	"special_instructions" text,
	"emergency_contact" jsonb,
	"is_recurring" boolean DEFAULT false,
	"recurring_frequency" text,
	"recurring_end_date" timestamp,
	"parent_booking_id" varchar,
	"reminders_sent" integer DEFAULT 0,
	"customer_rating" integer,
	"customer_rating_breakdown" jsonb,
	"provider_rating" integer,
	"provider_rating_breakdown" jsonb,
	"notes" text,
	"locksmith_category" text,
	"locksmith_service_type" text,
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" text,
	"key_type" text,
	"lock_type" text,
	"number_of_locks" integer,
	"business_type" text,
	"number_of_doors" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference"),
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" varchar NOT NULL,
	"service_id" varchar,
	"provider_id" varchar,
	"service_type" text NOT NULL,
	"service_name" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time" text NOT NULL,
	"duration" integer,
	"base_price" numeric(10, 2) NOT NULL,
	"add_ons_price" numeric(10, 2) DEFAULT '0',
	"subtotal" numeric(10, 2) NOT NULL,
	"tip_amount" numeric(10, 2) DEFAULT '0',
	"service_details" jsonb,
	"selected_addons" jsonb DEFAULT '[]',
	"comments" text,
	"added_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_token" text,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"service_type" text NOT NULL,
	"level" text NOT NULL,
	"required_modules" text[] NOT NULL,
	"validity_period" integer NOT NULL,
	"badge_icon" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar,
	"customer_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"subject" text,
	"status" text DEFAULT 'active',
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"communication" integer,
	"courtesy" integer,
	"cleanliness" integer,
	"accessibility" integer,
	"instructions" integer,
	"comment" text,
	"would_work_again" boolean DEFAULT true,
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"service_type" varchar NOT NULL,
	"customer_latitude" real NOT NULL,
	"customer_longitude" real NOT NULL,
	"max_radius" real DEFAULT 20,
	"priority" integer DEFAULT 1,
	"status" varchar DEFAULT 'pending',
	"assigned_provider_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"attachments" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"edited_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"action_url" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"source_cart_item_id" varchar,
	"booking_id" varchar,
	"service_id" varchar,
	"provider_id" varchar,
	"service_name" text NOT NULL,
	"service_type" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time" text NOT NULL,
	"duration" integer,
	"base_price" numeric(10, 2) NOT NULL,
	"add_ons_price" numeric(10, 2) DEFAULT '0',
	"subtotal" numeric(10, 2) NOT NULL,
	"tip_amount" numeric(10, 2) DEFAULT '0',
	"service_details" jsonb,
	"selected_addons" jsonb DEFAULT '[]',
	"comments" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"cart_id" varchar,
	"order_number" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"service_fee" numeric(10, 2) DEFAULT '0',
	"platform_fee" numeric(10, 2) DEFAULT '0',
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"payment_intent_id" text,
	"stripe_charge_id" text,
	"card_last4" text,
	"card_brand" text,
	"cardholder_name" text,
	"account_last4" text,
	"bank_name" text,
	"account_holder" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"confirmation_sent_at" timestamp,
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"refund_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"stripe_payment_method_id" text,
	"card_last4" varchar,
	"card_brand" varchar,
	"card_holder_name" varchar,
	"expiry_month" integer,
	"expiry_year" integer,
	"bank_name" varchar,
	"account_holder_name" varchar,
	"nickname" varchar,
	"billing_address" jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotional_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_amount" numeric(10, 2),
	"maximum_discount" numeric(10, 2),
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"applicable_services" text[],
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "promotional_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "provider_assessment_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"assessment_id" varchar NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" jsonb,
	"feedback" text,
	"attempt_number" integer NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_availability" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_available" boolean DEFAULT true,
	"max_bookings_per_slot" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"certification_id" varchar NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"earned_at" timestamp,
	"expires_at" timestamp,
	"certificate_number" text,
	"verification_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_earnings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"booking_id" varchar NOT NULL,
	"base_amount" numeric(10, 2) NOT NULL,
	"tip_amount" numeric(10, 2) DEFAULT '0',
	"bonus_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"platform_commission" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"payout_status" text DEFAULT 'pending',
	"payout_date" timestamp,
	"payout_reference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"is_online" boolean DEFAULT false,
	"last_seen" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_time_off" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reason" text,
	"is_approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_training_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"progress" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"attempts" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"service_quality" integer,
	"punctuality" integer,
	"professionalism" integer,
	"comment" text,
	"would_recommend" boolean DEFAULT true,
	"review_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"bio" text,
	"profile_image" text,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"services_offered" text[] NOT NULL,
	"category" text,
	"experience" text,
	"availability" jsonb,
	"is_verified" boolean DEFAULT false,
	"verification_status" text DEFAULT 'pending',
	"insurance_verified" boolean DEFAULT false,
	"background_check_verified" boolean DEFAULT false,
	"has_insurance" boolean DEFAULT false,
	"background_check_consent" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"location" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"id_document" text,
	"proof_of_address" text,
	"qualification_certificate" text,
	"banking_details" jsonb,
	"provider_type" text DEFAULT 'individual',
	"company_name" text,
	"company_registration" text,
	"tax_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"base_price" numeric(10, 2) NOT NULL,
	"price_type" text DEFAULT 'hourly',
	"estimated_duration" integer,
	"icon" text,
	"features" text[],
	"requirements" text[],
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skill_assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"service_type" text NOT NULL,
	"assessment_type" text NOT NULL,
	"questions" jsonb NOT NULL,
	"passing_score" integer NOT NULL,
	"time_limit" integer,
	"max_attempts" integer DEFAULT 3,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"user_id" varchar NOT NULL,
	"booking_id" varchar,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open',
	"assigned_to" varchar,
	"resolution_notes" text,
	"attachments" jsonb,
	"customer_satisfaction_rating" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "training_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"service_type" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_duration" integer NOT NULL,
	"content" jsonb NOT NULL,
	"prerequisites" text[],
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"password" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"latitude" real,
	"longitude" real,
	"profile_image" text,
	"role" text DEFAULT 'CLIENT',
	"is_provider" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"account_type" text DEFAULT 'INDIVIDUAL',
	"business_name" text,
	"business_registration_number" text,
	"vat_number" text,
	"business_address" text,
	"business_city" text,
	"business_postal_code" text,
	"business_country" text DEFAULT 'South Africa',
	"contact_person_first_name" text,
	"contact_person_last_name" text,
	"contact_person_email" text,
	"contact_person_phone" text,
	"contact_person_role" text,
	"google_id" text,
	"apple_id" text,
	"twitter_id" text,
	"instagram_id" text,
	"auth_provider" text DEFAULT 'email',
	"remember_token" text,
	"remember_token_expires_at" timestamp,
	"email_verification_token" text,
	"email_verification_expires_at" timestamp,
	"password_reset_token" text,
	"password_reset_expires_at" timestamp,
	"preferences" jsonb,
	"notification_settings" jsonb DEFAULT '{"email": true, "sms": true, "push": true, "marketing": false}',
	"preferred_services" text[],
	"preferred_providers" text[],
	"saved_addresses" jsonb,
	"default_address" text,
	"default_city" text,
	"default_postal_code" text,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"balance_before" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"booking_id" varchar,
	"service_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"auto_reload_enabled" boolean DEFAULT false,
	"auto_reload_threshold" numeric(10, 2) DEFAULT '10.00',
	"auto_reload_amount" numeric(10, 2) DEFAULT '50.00',
	"auto_reload_payment_method_id" varchar,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_assigned_provider_id_service_providers_id_fk" FOREIGN KEY ("assigned_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_assessment_results" ADD CONSTRAINT "provider_assessment_results_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_assessment_results" ADD CONSTRAINT "provider_assessment_results_assessment_id_skill_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."skill_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_certification_id_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_earnings" ADD CONSTRAINT "provider_earnings_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_earnings" ADD CONSTRAINT "provider_earnings_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_locations" ADD CONSTRAINT "provider_locations_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_time_off" ADD CONSTRAINT "provider_time_off_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_training_progress" ADD CONSTRAINT "provider_training_progress_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_training_progress" ADD CONSTRAINT "provider_training_progress_module_id_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."training_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;