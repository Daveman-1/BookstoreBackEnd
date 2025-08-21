-- Fix image_url column size issue (PostgreSQL)
-- This script alters the items table to increase the image_url column size
-- to accommodate base64 encoded images

ALTER TABLE items ALTER COLUMN image_url TYPE TEXT;

-- Verify the change
\d items; 