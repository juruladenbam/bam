-- ============================================
-- NIB Migration - Add nib column to persons table
-- ============================================
-- Run this FIRST before the seeder

ALTER TABLE persons 
ADD COLUMN nib VARCHAR(50) NULL AFTER legacy_id;

-- Add unique index for NIB
ALTER TABLE persons 
ADD UNIQUE INDEX persons_nib_unique (nib);

-- ============================================
-- To rollback if needed:
-- ============================================
-- ALTER TABLE persons DROP INDEX persons_nib_unique;
-- ALTER TABLE persons DROP COLUMN nib;
