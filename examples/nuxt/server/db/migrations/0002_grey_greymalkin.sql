CREATE TABLE `asaas_webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`asaas_event_id` text NOT NULL,
	`event` text NOT NULL,
	`date_created` text NOT NULL,
	`account_id` text,
	`owner_id` text,
	`additional_info` text,
	`raw_payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asaas_webhook_asaas_event_id_unique` ON `asaas_webhook` (`asaas_event_id`);