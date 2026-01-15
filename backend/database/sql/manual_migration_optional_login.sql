-- Manual Migration & Seed SQL for Optional Login Module
-- Project: BAM (Bani Abdul Manan)
-- Date: 2026-01-15

-- ---------------------------------------------------------
-- 1. UPDATE SUBMISSIONS TABLE SCHEMA
-- ---------------------------------------------------------

-- Make user_id nullable to allow submissions from guests (NIB Linked)
ALTER TABLE `submissions` MODIFY `user_id` BIGINT UNSIGNED NULL;

-- Add submitter_person_id to track which person (from NIB) is making the submission
-- Use procedure/check logic to avoid errors if already exists
SET @dbname = DATABASE();
SET @tablename = "submissions";
SET @columnname = "submitter_person_id";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE `submissions` ADD COLUMN `submitter_person_id` BIGINT UNSIGNED NULL AFTER `user_id`"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Foreign Key for submitter_person_id
SET @constraintname = "submissions_submitter_person_id_foreign";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND CONSTRAINT_NAME = @constraintname) > 0,
  "SELECT 1",
  "ALTER TABLE `submissions` ADD CONSTRAINT `submissions_submitter_person_id_foreign` FOREIGN KEY (`submitter_person_id`) REFERENCES `persons`(`id`) ON DELETE SET NULL"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------
-- 2. SEED PORTAL SETTINGS
-- ---------------------------------------------------------

-- Add configurations to toggle Login System and NIB Claiming
INSERT INTO `site_settings` (`key`, `value`, `type`, `created_at`, `updated_at`)
VALUES 
    ('portal.login_enabled', 'true', 'boolean', NOW(), NOW()),
    ('portal.nib_claiming_enabled', 'true', 'boolean', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `value` = VALUES(`value`),
    `updated_at` = NOW();

-- ---------------------------------------------------------
-- FINISHED
-- ---------------------------------------------------------
