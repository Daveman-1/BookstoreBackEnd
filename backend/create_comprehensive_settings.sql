-- Create comprehensive system_settings table for all store configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_category ENUM('store_info', 'business_settings', 'receipt_settings', 'system_settings') DEFAULT 'store_info',
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default store settings organized by categories
INSERT INTO system_settings (setting_key, setting_value, setting_category, is_public, description) VALUES
-- Store Info Settings
('name', 'Bookstore', 'store_info', TRUE, 'Store name displayed throughout the system'),
('address', '', 'store_info', TRUE, 'Store physical address'),
('phone', '', 'store_info', TRUE, 'Store phone number'),
('email', '', 'store_info', TRUE, 'Store email address'),
('website', '', 'store_info', TRUE, 'Store website URL'),
('taxNumber', '', 'store_info', TRUE, 'Store tax number or VAT ID'),
('footer', '', 'store_info', TRUE, 'Custom footer message for receipts'),
('logo', '', 'store_info', TRUE, 'Store logo (base64 encoded)'),

-- Business Settings
('business_hours_monday', '09:00-18:00', 'business_settings', TRUE, 'Monday business hours'),
('business_hours_tuesday', '09:00-18:00', 'business_settings', TRUE, 'Tuesday business hours'),
('business_hours_wednesday', '09:00-18:00', 'business_settings', TRUE, 'Wednesday business hours'),
('business_hours_thursday', '09:00-18:00', 'business_settings', TRUE, 'Thursday business hours'),
('business_hours_friday', '09:00-18:00', 'business_settings', TRUE, 'Friday business hours'),
('business_hours_saturday', '09:00-16:00', 'business_settings', TRUE, 'Saturday business hours'),
('business_hours_sunday', 'Closed', 'business_settings', TRUE, 'Sunday business hours'),
('currency', 'GHS', 'business_settings', TRUE, 'Default currency'),
('currency_symbol', '₵', 'business_settings', TRUE, 'Currency symbol'),
('tax_rate', '0', 'business_settings', TRUE, 'Default tax rate percentage'),
('tax_calculation', 'exclusive', 'business_settings', TRUE, 'Tax calculation method (inclusive/exclusive)'),
('min_stock_level', '10', 'business_settings', TRUE, 'Default minimum stock level for items'),
('low_stock_threshold', '10', 'business_settings', TRUE, 'Low stock alert threshold'),

-- Receipt Settings
('receipt_title', 'SALES RECEIPT', 'receipt_settings', TRUE, 'Receipt title'),
('receipt_width', '80mm', 'receipt_settings', TRUE, 'Receipt width (80mm, 58mm, A4)'),
('receipt_font_size', '10', 'receipt_settings', TRUE, 'Receipt font size'),
('receipt_number_prefix', 'RCP', 'receipt_settings', TRUE, 'Receipt number prefix'),
('receipt_auto_increment', 'true', 'receipt_settings', TRUE, 'Auto-increment receipt numbers'),
('receipt_show_logo', 'true', 'receipt_settings', TRUE, 'Show logo on receipts'),
('receipt_show_tax_breakdown', 'true', 'receipt_settings', TRUE, 'Show tax breakdown on receipts'),
('receipt_show_item_descriptions', 'true', 'receipt_settings', TRUE, 'Show item descriptions on receipts'),
('receipt_show_sku', 'false', 'receipt_settings', TRUE, 'Show SKU on receipts'),
('receipt_date_format', 'DD/MM/YYYY', 'receipt_settings', TRUE, 'Receipt date format'),
('receipt_time_format', '24', 'receipt_settings', TRUE, 'Receipt time format (12/24 hour)'),

-- System Settings
('theme', 'light', 'system_settings', TRUE, 'UI theme (light/dark)'),
('language', 'en', 'system_settings', TRUE, 'System language'),
('date_format', 'DD/MM/YYYY', 'system_settings', TRUE, 'Date format'),
('time_format', '24', 'system_settings', TRUE, 'Time format (12/24 hour)'),
('session_timeout', '30', 'system_settings', FALSE, 'Session timeout in minutes'),
('auto_backup_frequency', 'daily', 'system_settings', FALSE, 'Auto-backup frequency'),
('backup_retention_days', '30', 'system_settings', FALSE, 'Backup retention period in days'),
('max_login_attempts', '5', 'system_settings', FALSE, 'Maximum login attempts'),
('enable_two_factor', 'false', 'system_settings', FALSE, 'Enable two-factor authentication'),
('page_size', '20', 'system_settings', TRUE, 'Default page size for lists'),
('search_results_limit', '50', 'system_settings', TRUE, 'Maximum search results')
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    setting_category = VALUES(setting_category),
    description = VALUES(description),
    is_public = VALUES(is_public);

-- Create indexes for better performance
CREATE INDEX idx_setting_category ON system_settings(setting_category);
CREATE INDEX idx_is_public ON system_settings(is_public);

-- Verify the table was created and populated
SELECT setting_category, setting_key, setting_value, is_public FROM system_settings ORDER BY setting_category, setting_key; 