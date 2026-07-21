CREATE TABLE `asaas_payment` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`asaas_payment_id` text NOT NULL,
	`asaas_customer_id` text NOT NULL,
	`asaas_subscription_id` text,
	`status` text NOT NULL,
	`billing_type` text NOT NULL,
	`value` text NOT NULL,
	`due_date` text NOT NULL,
	`payment_date` text,
	`description` text,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asaas_payment_asaas_payment_id_unique` ON `asaas_payment` (`asaas_payment_id`);--> statement-breakpoint
CREATE TABLE `asaas_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`asaas_subscription_id` text NOT NULL,
	`asaas_customer_id` text NOT NULL,
	`status` text NOT NULL,
	`billing_type` text NOT NULL,
	`cycle` text NOT NULL,
	`value` text NOT NULL,
	`next_due_date` text NOT NULL,
	`end_date` text,
	`description` text,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asaas_subscription_asaas_subscription_id_unique` ON `asaas_subscription` (`asaas_subscription_id`);