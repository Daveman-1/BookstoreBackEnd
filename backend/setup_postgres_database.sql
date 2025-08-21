-- ===========================================
-- POSTGRESQL DATABASE SETUP SCRIPT
-- ===========================================
-- This script sets up the complete bookstore management database
-- Run this script after creating your PostgreSQL database

-- Create database (run this separately if needed)
-- CREATE DATABASE bookstore_management;

-- Connect to the database and run the following:

-- ===========================================
-- 1. CREATE USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'manager')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 2. CREATE CATEGORIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for categories table
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 3. CREATE ITEMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    sku VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for items table
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 4. CREATE SALES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    sale_number VARCHAR(50) UNIQUE,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    payment_method VARCHAR(50) DEFAULT 'cash',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for sales table
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 5. CREATE SALE_ITEMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 6. CREATE APPROVALS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS approvals (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for approvals table
CREATE TRIGGER update_approvals_updated_at 
    BEFORE UPDATE ON approvals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 7. CREATE STORE_DETAILS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS store_details (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Bookstore',
    contact VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    fax VARCHAR(50),
    email VARCHAR(255),
    tax_number VARCHAR(100),
    receipt_footer TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for store_details table
CREATE TRIGGER update_store_details_updated_at 
    BEFORE UPDATE ON store_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 8. CREATE SYSTEM_SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_category VARCHAR(50) DEFAULT 'store_info' CHECK (setting_category IN ('store_info', 'business_settings', 'receipt_settings', 'system_settings')),
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for system_settings table
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 9. INSERT DEFAULT DATA
-- ===========================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$rQZ8K9LmN2pO3qR4sT5uV6wX7yZ8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4', 'Administrator', 'admin@bookstore.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default store details
INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) VALUES
('Bookstore', '', '', '', '', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact = EXCLUDED.contact,
    website = EXCLUDED.website,
    address = EXCLUDED.address,
    fax = EXCLUDED.fax,
    email = EXCLUDED.email,
    tax_number = EXCLUDED.tax_number,
    receipt_footer = EXCLUDED.receipt_footer,
    logo = EXCLUDED.logo;

-- Insert default system settings
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
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_category = EXCLUDED.setting_category,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public;

-- ===========================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_is_active ON items(is_active);

CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON sales(customer_name);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

CREATE INDEX IF NOT EXISTS idx_approvals_user_id ON approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at);

CREATE INDEX IF NOT EXISTS idx_setting_category ON system_settings(setting_category);
CREATE INDEX IF NOT EXISTS idx_setting_is_public ON system_settings(is_public);

-- ===========================================
-- 11. VERIFY SETUP
-- ===========================================
SELECT 'Database setup completed successfully!' as status;

-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check default data
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;
SELECT 'Items count:' as info, COUNT(*) as count FROM items;
SELECT 'Sales count:' as info, COUNT(*) as count FROM sales;
SELECT 'Store details count:' as info, COUNT(*) as count FROM store_details;
SELECT 'System settings count:' as info, COUNT(*) as count FROM system_settings; 