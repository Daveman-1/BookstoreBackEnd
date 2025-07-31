-- Fix image_url column size issue
-- This script alters the items table to increase the image_url column size
-- to accommodate base64 encoded images

ALTER TABLE items MODIFY COLUMN image_url LONGTEXT;

-- Verify the change
DESCRIBE items; 