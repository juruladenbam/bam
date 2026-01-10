-- ============================================
-- BAM Portal - Migration SQL
-- Generated from commit: 6358687eb3bf888458b3b5cf88db3cbf47585154
-- Date: 2026-01-10
-- ============================================

-- ============================================
-- 1. CREATE TABLE: islamic_holidays
-- ============================================

CREATE TABLE IF NOT EXISTS `islamic_holidays` (
    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `name_arabic` varchar(255) DEFAULT NULL,
    `hijri_month` tinyint(4) NOT NULL COMMENT '1-12',
    `hijri_day` tinyint(4) NOT NULL COMMENT '1-30',
    `duration_days` tinyint(4) NOT NULL DEFAULT 1,
    `description` text DEFAULT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 2. INSERT SEEDER DATA: islamic_holidays
-- ============================================

INSERT INTO `islamic_holidays` (`name`, `name_arabic`, `hijri_month`, `hijri_day`, `duration_days`, `description`, `is_active`) VALUES
('Tahun Baru Hijriyah', 'رأس السنة الهجرية', 1, 1, 1, 'Awal tahun baru dalam kalender Hijriyah (1 Muharram)', 1),
('Hari Asyura', 'يوم عاشوراء', 1, 10, 1, 'Hari ke-10 Muharram, dianjurkan berpuasa', 1),
('Maulid Nabi Muhammad', 'المولد النبوي', 3, 12, 1, 'Peringatan kelahiran Nabi Muhammad SAW (12 Rabiul Awal)', 1),
('Isra Mi''raj', 'الإسراء والمعراج', 7, 27, 1, 'Peringatan perjalanan Nabi Muhammad SAW dari Masjidil Haram ke Masjidil Aqsa dan naik ke Sidratul Muntaha (27 Rajab)', 1),
('Nisfu Sya''ban', 'ليلة النصف من شعبان', 8, 15, 1, 'Malam pertengahan bulan Sya''ban (15 Sya''ban)', 1),
('Awal Ramadhan', 'بداية رمضان', 9, 1, 1, 'Hari pertama bulan Ramadhan, awal puasa', 1),
('Nuzulul Quran', 'نزول القرآن', 9, 17, 1, 'Peringatan turunnya Al-Quran (17 Ramadhan)', 1),
('Idul Fitri', 'عيد الفطر', 10, 1, 2, 'Hari Raya Idul Fitri setelah sebulan berpuasa (1-2 Syawal)', 1),
('Hari Arafah', 'يوم عرفة', 12, 9, 1, 'Hari wukuf di Arafah bagi jamaah haji (9 Dzulhijjah)', 1),
('Idul Adha', 'عيد الأضحى', 10, 10, 4, 'Hari Raya Qurban (10-13 Dzulhijjah)', 1)
ON DUPLICATE KEY UPDATE
    `name_arabic` = VALUES(`name_arabic`),
    `hijri_month` = VALUES(`hijri_month`),
    `hijri_day` = VALUES(`hijri_day`),
    `duration_days` = VALUES(`duration_days`),
    `description` = VALUES(`description`);


-- ============================================
-- 3. ADD CALENDAR SETTING (if site_settings table exists)
-- ============================================

INSERT INTO `site_settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
('calendar.hijri_offset', '0', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();


-- ============================================
-- 4. UPDATE MIGRATIONS TABLE (optional, for Laravel tracking)
-- ============================================

INSERT INTO `migrations` (`migration`, `batch`) VALUES
('2026_01_09_000001_create_islamic_holidays_table', (SELECT IFNULL(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) AS m))
ON DUPLICATE KEY UPDATE `migration` = `migration`;
