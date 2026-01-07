CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('dua','verse','book','adhkar') NOT NULL,
	`contentId` varchar(255) NOT NULL,
	`title` text,
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quran_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`surahNumber` int NOT NULL,
	`ayahNumber` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quran_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasbeeh_counter` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`name` varchar(255) NOT NULL DEFAULT 'التسبيح',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasbeeh_counter_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`prayerNotifications` int NOT NULL DEFAULT 1,
	`notificationMinutesBefore` int NOT NULL DEFAULT 15,
	`preferredQuranReciter` varchar(100) DEFAULT 'ar.alafasy',
	`theme` enum('light','dark') NOT NULL DEFAULT 'light',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `worship_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`fajr` int NOT NULL DEFAULT 0,
	`dhuhr` int NOT NULL DEFAULT 0,
	`asr` int NOT NULL DEFAULT 0,
	`maghrib` int NOT NULL DEFAULT 0,
	`isha` int NOT NULL DEFAULT 0,
	`quranReading` int NOT NULL DEFAULT 0,
	`adhkar` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `worship_tracking_id` PRIMARY KEY(`id`)
);
