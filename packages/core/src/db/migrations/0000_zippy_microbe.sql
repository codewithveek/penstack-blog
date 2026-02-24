CREATE TABLE `media_assets` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`provider_id` varchar(100),
	`provider` varchar(32) NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`original_filename` varchar(512),
	`media_type` enum('image','video','audio','document','other') NOT NULL DEFAULT 'image',
	`mime_type` varchar(127),
	`size_bytes` int,
	`width` int,
	`height` int,
	`alt_text` varchar(255),
	`caption` text,
	`folder` varchar(255) NOT NULL DEFAULT '/',
	`uploaded_by_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_auth_tokens` (
	`id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `member_auth_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_auth_tokens_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `member_sessions` (
	`id` varchar(255) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`token` varchar(500) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(64),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `member_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`avatar` text,
	`status` enum('active','inactive','banned') NOT NULL DEFAULT 'active',
	`email_verified` boolean NOT NULL DEFAULT false,
	`subscribed` boolean NOT NULL DEFAULT true,
	`note` text,
	`last_seen_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_site_email_unique` UNIQUE(`site_id`,`email`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`tier_id` varchar(36) NOT NULL,
	`subscription_status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL,
	`interval` enum('month','year') NOT NULL,
	`provider_subscription_id` varchar(255),
	`provider_customer_id` varchar(255),
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`cancel_at_period_end` boolean NOT NULL DEFAULT false,
	`canceled_at` timestamp,
	`trial_start` timestamp,
	`trial_end` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiers` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`monthly_price_cents` int,
	`yearly_price_cents` int,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`benefits` text,
	`active` boolean NOT NULL DEFAULT true,
	`stripe_product_id` varchar(255),
	`stripe_monthly_price_id` varchar(255),
	`stripe_yearly_price_id` varchar(255),
	`trial_days` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `tiers_site_slug_unique` UNIQUE(`site_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `email_events` (
	`id` varchar(36) NOT NULL,
	`recipient_id` varchar(36) NOT NULL,
	`email_event_type` enum('delivered','opened','clicked','bounced','complained','unsubscribed') NOT NULL,
	`occurred_at` timestamp NOT NULL,
	`metadata` text,
	CONSTRAINT `email_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_send_recipients` (
	`id` varchar(36) NOT NULL,
	`email_send_id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`provider_message_id` varchar(255),
	`delivered_at` timestamp,
	`opened_at` timestamp,
	`clicked_at` timestamp,
	`tracking_id` varchar(36) NOT NULL,
	CONSTRAINT `email_send_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_send_recipients_send_member` UNIQUE(`email_send_id`,`member_id`),
	CONSTRAINT `email_send_recipients_tracking_id` UNIQUE(`tracking_id`)
);
--> statement-breakpoint
CREATE TABLE `email_sends` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`newsletter_id` varchar(36) NOT NULL,
	`post_id` varchar(36),
	`subject` varchar(500) NOT NULL,
	`from_email` varchar(255) NOT NULL,
	`from_name` varchar(255) NOT NULL,
	`reply_to` varchar(255),
	`email_send_status` enum('queued','sending','sent','failed') NOT NULL DEFAULT 'queued',
	`scheduled_at` timestamp,
	`sent_at` timestamp,
	`recipient_count` int NOT NULL DEFAULT 0,
	`delivered_count` int NOT NULL DEFAULT 0,
	`opened_count` int NOT NULL DEFAULT 0,
	`clicked_count` int NOT NULL DEFAULT 0,
	`bounced_count` int NOT NULL DEFAULT 0,
	`failed_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_sends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_newsletters` (
	`member_id` varchar(36) NOT NULL,
	`newsletter_id` varchar(36) NOT NULL,
	`subscribed_at` timestamp NOT NULL,
	CONSTRAINT `member_newsletters_pk` UNIQUE(`member_id`,`newsletter_id`)
);
--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`sender_name` varchar(255),
	`sender_email` varchar(255),
	`reply_to_email` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`subscribe_on_signup` boolean NOT NULL DEFAULT true,
	`header_html` text,
	`footer_html` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletters_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletters_site_slug_unique` UNIQUE(`site_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `post_authors` (
	`post_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('primary','co_author','contributor') NOT NULL DEFAULT 'primary',
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `post_authors_pk` UNIQUE(`post_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` varchar(36) NOT NULL,
	`tag_id` varchar(36) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `post_tags_pk` UNIQUE(`post_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `post_views` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`member_id` varchar(36),
	`ip_hash` varchar(64),
	`user_agent_hash` varchar(64),
	`referrer` text,
	`country` varchar(4),
	`device_type` varchar(32),
	`viewed_at` timestamp NOT NULL,
	CONSTRAINT `post_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`type` enum('post','page') NOT NULL DEFAULT 'post',
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`permalink` varchar(255),
	`lexical` json,
	`html` longtext,
	`excerpt` text,
	`featured_image` text,
	`featured_image_alt` varchar(255),
	`status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
	`visibility` enum('public','members','paid') NOT NULL DEFAULT 'public',
	`reading_time_minutes` int DEFAULT 0,
	`allow_comments` boolean NOT NULL DEFAULT true,
	`send_newsletter` boolean NOT NULL DEFAULT false,
	`scheduled_at` timestamp,
	`published_at` timestamp,
	`custom_head_code` text,
	`custom_foot_code` text,
	`og_title` varchar(255),
	`og_description` varchar(500),
	`og_image` text,
	`twitter_title` varchar(255),
	`twitter_description` varchar(500),
	`twitter_image` text,
	`canonical_url` text,
	`newsletter_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_site_slug_unique` UNIQUE(`site_id`,`slug`),
	CONSTRAINT `posts_site_permalink_unique` UNIQUE(`site_id`,`permalink`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` varchar(500),
	`feature_image` text,
	`visibility` varchar(16) NOT NULL DEFAULT 'public',
	`og_title` varchar(255),
	`og_description` varchar(500),
	`og_image` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_site_slug_unique` UNIQUE(`site_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`api_key_role` enum('content','admin') NOT NULL,
	`key_prefix` varchar(32) NOT NULL,
	`key_hash` varchar(128) NOT NULL,
	`key_salt` varchar(64) NOT NULL,
	`last_used_at` timestamp,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_hash_unique` UNIQUE(`key_hash`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`key` varchar(255) NOT NULL,
	`value` text,
	`description` text,
	`encrypted` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `platform_setup_status` (
	`id` varchar(36) NOT NULL,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`setup_version` varchar(32),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_setup_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`from_path` varchar(500) NOT NULL,
	`to_path` varchar(500) NOT NULL,
	`redirect_type` enum('301','302') NOT NULL DEFAULT '301',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `redirects_id` PRIMARY KEY(`id`),
	CONSTRAINT `redirects_site_from_path_unique` UNIQUE(`site_id`,`from_path`)
);
--> statement-breakpoint
CREATE TABLE `site_auth_settings` (
	`site_id` varchar(36) NOT NULL,
	`google_enabled` boolean NOT NULL DEFAULT false,
	`google_client_id` text,
	`google_client_secret` text,
	`facebook_enabled` boolean NOT NULL DEFAULT false,
	`facebook_app_id` text,
	`facebook_app_secret` text,
	`allow_social_for_admins` boolean NOT NULL DEFAULT false,
	`allow_social_for_members` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_auth_settings_site_id` PRIMARY KEY(`site_id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`site_id` varchar(36) NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`encrypted` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_site_id_key_pk` PRIMARY KEY(`site_id`,`key`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` varchar(36) NOT NULL,
	`webhook_id` varchar(36) NOT NULL,
	`event_type` varchar(255) NOT NULL,
	`payload` text NOT NULL,
	`webhook_status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`http_status` varchar(4),
	`response_body` text,
	`attempt_count` varchar(4) NOT NULL DEFAULT '0',
	`next_attempt_at` timestamp,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`target_url` text NOT NULL,
	`event_triggers` text NOT NULL,
	`secret` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(63) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`custom_domain` varchar(255),
	`custom_domain_verified` boolean NOT NULL DEFAULT false,
	`theme` varchar(255) NOT NULL DEFAULT 'default',
	`setup_completed` boolean NOT NULL DEFAULT false,
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`locale` varchar(16) NOT NULL DEFAULT 'en',
	`favicon` text,
	`logo` text,
	`cover_image` text,
	`payment_customer_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `sites_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `sites_custom_domain_unique` UNIQUE(`custom_domain`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_account_unique` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(500) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(64),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text,
	`slug` varchar(255) NOT NULL,
	`site_role` enum('super_admin','owner','admin','editor','author','contributor') NOT NULL DEFAULT 'contributor',
	`bio` text,
	`avatar` text,
	`cover_image` text,
	`website` varchar(255),
	`twitter` varchar(255),
	`facebook` varchar(255),
	`location` varchar(255),
	`email_verified` boolean NOT NULL DEFAULT false,
	`is_super_admin` boolean NOT NULL DEFAULT false,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_site_email_unique` UNIQUE(`site_id`,`email`),
	CONSTRAINT `users_site_slug_unique` UNIQUE(`site_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_auth_tokens` ADD CONSTRAINT `member_auth_tokens_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_sessions` ADD CONSTRAINT `member_sessions_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `members` ADD CONSTRAINT `members_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_tier_id_tiers_id_fk` FOREIGN KEY (`tier_id`) REFERENCES `tiers`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tiers` ADD CONSTRAINT `tiers_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_events` ADD CONSTRAINT `email_events_recipient_id_email_send_recipients_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `email_send_recipients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_send_recipients` ADD CONSTRAINT `email_send_recipients_email_send_id_email_sends_id_fk` FOREIGN KEY (`email_send_id`) REFERENCES `email_sends`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_send_recipients` ADD CONSTRAINT `email_send_recipients_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_sends` ADD CONSTRAINT `email_sends_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_sends` ADD CONSTRAINT `email_sends_newsletter_id_newsletters_id_fk` FOREIGN KEY (`newsletter_id`) REFERENCES `newsletters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_newsletters` ADD CONSTRAINT `member_newsletters_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_newsletters` ADD CONSTRAINT `member_newsletters_newsletter_id_newsletters_id_fk` FOREIGN KEY (`newsletter_id`) REFERENCES `newsletters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletters` ADD CONSTRAINT `newsletters_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_authors` ADD CONSTRAINT `post_authors_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_authors` ADD CONSTRAINT `post_authors_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_views` ADD CONSTRAINT `post_views_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_views` ADD CONSTRAINT `post_views_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tags` ADD CONSTRAINT `tags_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redirects` ADD CONSTRAINT `redirects_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_auth_settings` ADD CONSTRAINT `site_auth_settings_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_settings` ADD CONSTRAINT `site_settings_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_webhook_id_webhooks_id_fk` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_assets_site_id` ON `media_assets` (`site_id`);--> statement-breakpoint
CREATE INDEX `media_assets_site_created` ON `media_assets` (`site_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `media_assets_site_type` ON `media_assets` (`site_id`,`media_type`);--> statement-breakpoint
CREATE INDEX `media_assets_site_folder` ON `media_assets` (`site_id`,`folder`);--> statement-breakpoint
CREATE INDEX `member_auth_tokens_member_id` ON `member_auth_tokens` (`member_id`);--> statement-breakpoint
CREATE INDEX `member_sessions_member_id` ON `member_sessions` (`member_id`);--> statement-breakpoint
CREATE INDEX `members_site_status` ON `members` (`site_id`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_member_id` ON `subscriptions` (`member_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_site_id` ON `subscriptions` (`site_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_provider_id` ON `subscriptions` (`provider_subscription_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status` ON `subscriptions` (`site_id`,`subscription_status`);--> statement-breakpoint
CREATE INDEX `tiers_site_id` ON `tiers` (`site_id`);--> statement-breakpoint
CREATE INDEX `email_events_recipient_id` ON `email_events` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `email_events_event_type` ON `email_events` (`email_event_type`);--> statement-breakpoint
CREATE INDEX `email_send_recipients_member_id` ON `email_send_recipients` (`member_id`);--> statement-breakpoint
CREATE INDEX `email_sends_site_id` ON `email_sends` (`site_id`);--> statement-breakpoint
CREATE INDEX `email_sends_status` ON `email_sends` (`site_id`,`email_send_status`);--> statement-breakpoint
CREATE INDEX `email_sends_newsletter_id` ON `email_sends` (`newsletter_id`);--> statement-breakpoint
CREATE INDEX `member_newsletters_newsletter_id` ON `member_newsletters` (`newsletter_id`);--> statement-breakpoint
CREATE INDEX `newsletters_site_id` ON `newsletters` (`site_id`);--> statement-breakpoint
CREATE INDEX `post_authors_user_id` ON `post_authors` (`user_id`);--> statement-breakpoint
CREATE INDEX `post_tags_tag_id` ON `post_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `post_views_site_post` ON `post_views` (`site_id`,`post_id`);--> statement-breakpoint
CREATE INDEX `post_views_viewed_at` ON `post_views` (`viewed_at`);--> statement-breakpoint
CREATE INDEX `posts_site_id` ON `posts` (`site_id`);--> statement-breakpoint
CREATE INDEX `posts_status` ON `posts` (`site_id`,`status`);--> statement-breakpoint
CREATE INDEX `posts_type` ON `posts` (`site_id`,`type`);--> statement-breakpoint
CREATE INDEX `posts_published_at` ON `posts` (`site_id`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_visibility` ON `posts` (`site_id`,`visibility`);--> statement-breakpoint
CREATE INDEX `posts_scheduled` ON `posts` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `posts_title` ON `posts` (`title`);--> statement-breakpoint
CREATE INDEX `tags_site_id` ON `tags` (`site_id`);--> statement-breakpoint
CREATE INDEX `api_keys_site_role` ON `api_keys` (`site_id`,`api_key_role`);--> statement-breakpoint
CREATE INDEX `redirects_site_id` ON `redirects` (`site_id`);--> statement-breakpoint
CREATE INDEX `site_settings_site_id` ON `site_settings` (`site_id`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_webhook_status` ON `webhook_deliveries` (`webhook_id`,`webhook_status`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_next_attempt` ON `webhook_deliveries` (`next_attempt_at`);--> statement-breakpoint
CREATE INDEX `webhooks_site_id` ON `webhooks` (`site_id`);--> statement-breakpoint
CREATE INDEX `accounts_user_id` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_site_role` ON `users` (`site_id`,`site_role`);--> statement-breakpoint
CREATE INDEX `verifications_identifier` ON `verifications` (`identifier`);