-- Create system_settings table for storing store configuration (PostgreSQL)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public;

-- Verify the table was created and populated
SELECT * FROM system_settings; 