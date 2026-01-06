CREATE TABLE `ContactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ContactMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Medias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`thumbnail` text,
	`preview` text,
	`type` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`mime_type` varchar(100),
	`caption` varchar(255),
	`alt_text` varchar(255),
	`width` int,
	`height` int,
	`folder` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Medias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EmailEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email_id` varchar(255) NOT NULL,
	`newsletter_id` int,
	`subscriber_id` int,
	`event_type` enum('sent','delivered','delivery_delayed','bounced','complained','opened','clicked') NOT NULL,
	`event_data` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `EmailEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `NewsLetterRecipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newsletter_id` int NOT NULL,
	`subscriber_id` int NOT NULL,
	`sent_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `NewsLetterRecipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `NewsLetterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
	`verification_status` enum('verified','unverified') NOT NULL DEFAULT 'unverified',
	`verification_token` varchar(255),
	`verification_token_expires` timestamp,
	`unsubscribed_at` timestamp,
	`referrer` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `NewsLetterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `NewsLetterSubscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `email_index` UNIQUE(`email`),
	CONSTRAINT `verification_token_index` UNIQUE(`verification_token`)
);
--> statement-breakpoint
CREATE TABLE `NewsLetters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`preview_text` varchar(255),
	`content` text NOT NULL,
	`status` enum('draft','scheduled','sent','failed') NOT NULL DEFAULT 'draft',
	`scheduled_for` timestamp,
	`sent_at` timestamp,
	`resend_email_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `NewsLetters_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_id_index` UNIQUE(`content_id`)
);
--> statement-breakpoint
CREATE TABLE `ActivePostViewers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(100),
	`session_id` varchar(255) NOT NULL,
	`last_active` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ActivePostViewers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `PostViewAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(100),
	`session_id` varchar(255) NOT NULL,
	`device_type` varchar(50),
	`browser` varchar(50),
	`os` varchar(50),
	`country` varchar(2),
	`region` varchar(100),
	`city` varchar(100),
	`time_spent` int,
	`scroll_depth` int,
	`entry_point` varchar(255),
	`exit_point` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `PostViewAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `PostViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(100),
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`referrer` varchar(255),
	`viewed_at` timestamp DEFAULT (now()),
	CONSTRAINT `PostViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `PostReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`reaction_type_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `PostReactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `PostReactions_post_id_user_id_reaction_type_id_unique` UNIQUE(`post_id`,`user_id`,`reaction_type_id`)
);
--> statement-breakpoint
CREATE TABLE `PostShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`share_type` varchar(50) NOT NULL,
	`share_url` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `PostShares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ReactionTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`display_name` varchar(50) NOT NULL,
	`emoji` varchar(10),
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`allow_multiple` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ReactionTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `ReactionTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `Categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `Categories_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `idx_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `Comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text,
	`status` enum('approved','pending','disapproved','deleted') DEFAULT 'pending',
	`post_id` int NOT NULL,
	`author_id` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `PostSeoMeta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`title` varchar(150),
	`canonical_url` varchar(255),
	`description` varchar(255),
	`image` varchar(255),
	`keywords` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `PostSeoMeta_id` PRIMARY KEY(`id`),
	CONSTRAINT `PostSeoMeta_post_id_unique` UNIQUE(`post_id`),
	CONSTRAINT `idx_post_id` UNIQUE(`post_id`)
);
--> statement-breakpoint
CREATE TABLE `PostTags` (
	`post_id` int NOT NULL,
	`tag_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext,
	`summary` varchar(500),
	`meta_id` int,
	`generate_toc` boolean DEFAULT true,
	`toc_depth` int DEFAULT 2,
	`toc` json,
	`post_id` varchar(255) NOT NULL DEFAULT (UUID()),
	`slug` varchar(255) NOT NULL,
	`status` enum('draft','published','deleted') DEFAULT 'draft',
	`scheduled_at` timestamp,
	`schedule_id` varchar(50),
	`author_id` varchar(100) NOT NULL,
	`visibility` enum('public','private') DEFAULT 'public',
	`category_id` int,
	`is_sticky` boolean DEFAULT false,
	`reading_time` int,
	`allow_comments` boolean DEFAULT false,
	`send_newsletter` boolean DEFAULT true,
	`newsletter_sent_at` timestamp,
	`featured_image_id` int,
	`created_at` timestamp DEFAULT (now()),
	`published_at` timestamp,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `Posts_post_id_unique` UNIQUE(`post_id`),
	CONSTRAINT `Posts_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `idx_post_id` UNIQUE(`post_id`),
	CONSTRAINT `idx_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `Replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text,
	`status` enum('approved','pending','disapproved','deleted') DEFAULT 'pending',
	`comment_id` int NOT NULL,
	`author_id` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `Tags_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `idx_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `SiteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`name` varchar(100) NOT NULL,
	`encrypted` boolean DEFAULT false,
	`enabled` boolean DEFAULT false,
	`can_encrypt` boolean DEFAULT false,
	`description` text,
	`folder` varchar(40) NOT NULL DEFAULT 'misc',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `SiteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_key` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `EmailServiceConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service_type` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT false,
	`api_key` text,
	`smtp_host` varchar(255),
	`smtp_port` int,
	`smtp_user` varchar(255),
	`smtp_password` text,
	`smtp_secure` boolean DEFAULT true,
	`from_email` varchar(255) NOT NULL,
	`from_name` varchar(255) NOT NULL,
	`additional_config` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `EmailServiceConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `OAuthProviderAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider_id` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`changed_by` varchar(255) NOT NULL,
	`changes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `OAuthProviderAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `OAuthProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider_name` varchar(50) NOT NULL,
	`display_name` varchar(100) NOT NULL,
	`client_id` varchar(500) NOT NULL,
	`client_secret` text NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`redirect_uri` varchar(500),
	`scopes` text,
	`additional_config` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `OAuthProviders_id` PRIMARY KEY(`id`),
	CONSTRAINT `OAuthProviders_provider_name_unique` UNIQUE(`provider_name`)
);
--> statement-breakpoint
CREATE TABLE `SetupStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`setup_version` varchar(20),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `SetupStatus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `UserBookmarks` (
	`user_id` varchar(100) NOT NULL,
	`post_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `UserBookmarks_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `Permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('dashboard:access','posts:create','posts:edit','posts:delete','posts:publish','posts:read','posts:schedule','posts:review','posts:view','users:read','users:write','users:edit','users:delete','roles:read','roles:write','roles:delete','media:upload','media:read','media:delete','media:edit','settings:read','settings:write','comments:create','comments:moderate','comments:read','comments:delete','comments:reply','newsletters:read','newsletters:write','newsletters:delete','auth:register','auth:login','categories:create','categories:read','tags:read','tags:create','pages:read','pages:edit','pages:delete','pages:write','seo:edit','seo:view','analytics:view','analytics:export') NOT NULL,
	`description` varchar(255),
	CONSTRAINT `Permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `Permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `RolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `RolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('admin','editor','author','contributor','moderator','seo_manager','newsletter_manager','subscriber','public') NOT NULL,
	`description` varchar(255),
	CONSTRAINT `Roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `Roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `UserMeta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`is_pro_member` boolean DEFAULT false,
	`last_login` timestamp DEFAULT CURRENT_TIMESTAMP,
	`last_login_ip` varchar(50),
	`last_login_location` varchar(255),
	`last_login_device` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `UserMeta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `UserRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `UserRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `UserSocials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`github` varchar(100),
	`facebook` varchar(100),
	`email` varchar(100),
	`website` varchar(100),
	`twitter` varchar(100),
	`instagram` varchar(100),
	`linkedin` varchar(100),
	`youtube` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `UserSocials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`bio` varchar(255),
	`title` varchar(100),
	`username` varchar(255),
	`avatar` varchar(255),
	`social_id` int,
	`meta_id` int,
	`account_status` varchar(30) DEFAULT 'active',
	`auth_id` varchar(100),
	`email_verified` boolean DEFAULT false,
	`auth_type` enum('local','google','github','facebook') DEFAULT 'local',
	`role_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `VerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` datetime NOT NULL,
	CONSTRAINT `VerificationTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `email_idx` ON `ContactMessages` (`email`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `ContactMessages` (`name`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `ContactMessages` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_media_name` ON `Medias` (`name`);--> statement-breakpoint
CREATE INDEX `idx_media_type` ON `Medias` (`type`);--> statement-breakpoint
CREATE INDEX `idx_media_folder` ON `Medias` (`folder`);--> statement-breakpoint
CREATE INDEX `idx_media_created_at` ON `Medias` (`created_at`);--> statement-breakpoint
CREATE INDEX `email_id_index` ON `EmailEvents` (`email_id`);--> statement-breakpoint
CREATE INDEX `newsletter_id_index` ON `EmailEvents` (`newsletter_id`);--> statement-breakpoint
CREATE INDEX `subscriber_id_index` ON `EmailEvents` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `event_type_index` ON `EmailEvents` (`event_type`);--> statement-breakpoint
CREATE INDEX `created_at_index` ON `EmailEvents` (`created_at`);--> statement-breakpoint
CREATE INDEX `newsletter_id_index` ON `NewsLetterRecipients` (`newsletter_id`);--> statement-breakpoint
CREATE INDEX `subscriber_id_index` ON `NewsLetterRecipients` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `sent_at_index` ON `NewsLetterRecipients` (`sent_at`);--> statement-breakpoint
CREATE INDEX `status_index` ON `NewsLetterSubscribers` (`status`);--> statement-breakpoint
CREATE INDEX `verification_status_index` ON `NewsLetterSubscribers` (`verification_status`);--> statement-breakpoint
CREATE INDEX `created_at_index` ON `NewsLetterSubscribers` (`created_at`);--> statement-breakpoint
CREATE INDEX `status_index` ON `NewsLetters` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_for_index` ON `NewsLetters` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `sent_at_index` ON `NewsLetters` (`sent_at`);--> statement-breakpoint
CREATE INDEX `idx_active_viewers_post_id` ON `ActivePostViewers` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_active_viewers_user_id` ON `ActivePostViewers` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_active_viewers_session_id` ON `ActivePostViewers` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_active_viewers_last_active` ON `ActivePostViewers` (`last_active`);--> statement-breakpoint
CREATE INDEX `idx_analytics_session` ON `PostViewAnalytics` (`post_id`,`created_at`,`session_id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_post_id` ON `PostViewAnalytics` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_user_id` ON `PostViewAnalytics` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_created_at` ON `PostViewAnalytics` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_country` ON `PostViewAnalytics` (`country`);--> statement-breakpoint
CREATE INDEX `idx_post_views_session` ON `PostViews` (`post_id`,`user_id`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `idx_post_views_post_id` ON `PostViews` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_post_views_user_id` ON `PostViews` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_post_views_viewed_at` ON `PostViews` (`viewed_at`);--> statement-breakpoint
CREATE INDEX `idx_post_reactions_post_id` ON `PostReactions` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_post_reactions_user_id` ON `PostReactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_post_reactions_reaction_type_id` ON `PostReactions` (`reaction_type_id`);--> statement-breakpoint
CREATE INDEX `idx_post_shares_post_id` ON `PostShares` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_post_shares_user_id` ON `PostShares` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_post_shares_share_type` ON `PostShares` (`share_type`);--> statement-breakpoint
CREATE INDEX `idx_reaction_type_name` ON `ReactionTypes` (`name`);--> statement-breakpoint
CREATE INDEX `idx_reaction_type_order` ON `ReactionTypes` (`order`);--> statement-breakpoint
CREATE INDEX `idx_name` ON `Categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `Comments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_post_id` ON `Comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_author_id` ON `Comments` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `Comments` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_seo_title` ON `PostSeoMeta` (`title`);--> statement-breakpoint
CREATE INDEX `idx_seo_canonical_url` ON `PostSeoMeta` (`canonical_url`);--> statement-breakpoint
CREATE INDEX `idx_post_tag` ON `PostTags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_title_summary` ON `Posts` (`title`,`summary`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `Posts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_author` ON `Posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `Posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `Posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_published_at` ON `Posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `Replies` (`status`);--> statement-breakpoint
CREATE INDEX `idx_comment_id` ON `Replies` (`comment_id`);--> statement-breakpoint
CREATE INDEX `idx_author_id` ON `Replies` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `Replies` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_name` ON `Tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_encrypted` ON `SiteSettings` (`encrypted`);--> statement-breakpoint
CREATE INDEX `idx_enabled` ON `SiteSettings` (`enabled`);--> statement-breakpoint
CREATE INDEX `idx_can_encrypt` ON `SiteSettings` (`can_encrypt`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `SiteSettings` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_updated_at` ON `SiteSettings` (`updated_at`);--> statement-breakpoint
CREATE INDEX `permissions_idx_name` ON `Permissions` (`name`);--> statement-breakpoint
CREATE INDEX `role_permission_idx` ON `RolePermissions` (`role_id`,`permission_id`);--> statement-breakpoint
CREATE INDEX `roles_idx_name` ON `Roles` (`name`);--> statement-breakpoint
CREATE INDEX `user_meta_user_id_idx` ON `UserMeta` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_role_idx` ON `UserRoles` (`user_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `user_socials_user_id_idx` ON `UserSocials` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `Users` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `Users` (`username`);--> statement-breakpoint
CREATE INDEX `auth_id_idx` ON `Users` (`auth_id`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `Users` (`role_id`);