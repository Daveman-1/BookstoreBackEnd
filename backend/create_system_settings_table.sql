-- Create system_settings table for storing store configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default store settings
INSERT INTO system_settings (setting_key, setting_value, is_public, description) VALUES
('name', 'Bookstore', TRUE, 'Store name displayed throughout the system'),
('address', '', TRUE, 'Store physical address'),
('phone', '', TRUE, 'Store phone number'),
('email', '', TRUE, 'Store email address'),
('website', '', TRUE, 'Store website URL'),
('taxNumber', '', TRUE, 'Store tax number or VAT ID'),
('footer', '', TRUE, 'Custom footer message for receipts'),
('logo', '', TRUE, 'Store logo (base64 encoded)')
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    description = VALUES(description),
    is_public = VALUES(is_public);

-- Verify the table was created and populated
SELECT * FROM system_settings; 