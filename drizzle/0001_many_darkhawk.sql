CREATE TABLE `glazes` (
	`id` varchar(32) NOT NULL,
	`name` varchar(160) NOT NULL,
	CONSTRAINT `glazes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `painting_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paintingId` varchar(32) NOT NULL,
	`customerId` int NOT NULL,
	`status` enum('active','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`cancelledAt` timestamp,
	CONSTRAINT `painting_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paintings` (
	`id` varchar(32) NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`imageUrl` varchar(255) NOT NULL,
	`status` enum('available','sold') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paintings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pottery_items` (
	`id` varchar(32) NOT NULL,
	`name` varchar(160) NOT NULL,
	CONSTRAINT `pottery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pottery_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`itemId` varchar(32) NOT NULL,
	`glazeId` varchar(32) NOT NULL,
	`quantity` int NOT NULL,
	`neededBy` varchar(10) NOT NULL,
	`status` enum('requested','accepted','declined','cancelled') NOT NULL DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pottery_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_settings` (
	`id` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`muralRatePerSqFt` int NOT NULL DEFAULT 150,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wall_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`bookingDate` varchar(10) NOT NULL,
	`wallSize` int NOT NULL,
	`address` text NOT NULL,
	`price` int NOT NULL,
	`status` enum('requested','confirmed','declined','cancelled') NOT NULL DEFAULT 'requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wall_bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `wall_bookings_booking_date_unique` UNIQUE(`bookingDate`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(128);--> statement-breakpoint
ALTER TABLE `painting_orders` ADD CONSTRAINT `painting_orders_paintingId_paintings_id_fk` FOREIGN KEY (`paintingId`) REFERENCES `paintings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `painting_orders` ADD CONSTRAINT `painting_orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pottery_requests` ADD CONSTRAINT `pottery_requests_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pottery_requests` ADD CONSTRAINT `pottery_requests_itemId_pottery_items_id_fk` FOREIGN KEY (`itemId`) REFERENCES `pottery_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pottery_requests` ADD CONSTRAINT `pottery_requests_glazeId_glazes_id_fk` FOREIGN KEY (`glazeId`) REFERENCES `glazes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wall_bookings` ADD CONSTRAINT `wall_bookings_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;