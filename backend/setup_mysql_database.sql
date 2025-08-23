-- MySQL Database Setup for BookStore Management System
-- Run this script to create the database and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bookstore_management;
USE bookstore_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    sku VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    payment_method ENUM('cash', 'card', 'transfer') DEFAULT 'cash',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
);

-- Approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSON,
    notes TEXT,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_category VARCHAR(50) DEFAULT 'system',
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Store details table
CREATE TABLE IF NOT EXISTS store_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact VARCHAR(100),
    website VARCHAR(200),
    address TEXT,
    fax VARCHAR(20),
    email VARCHAR(100),
    tax_number VARCHAR(50),
    receipt_footer TEXT,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_active ON items(is_active);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_item ON sale_items(item_id);
CREATE INDEX idx_approvals_user ON approvals(user_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, name, email, role) VALUES 
('admin', '$2b$10$rQZ8K9LmN2pQ3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2zA3bC4dE5fG6hI7jK8kL9mN0oP1qR2sT3uV4wX5yZ', 'Administrator', 'admin@bookstore.com', 'admin');

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Fiction', 'Fiction books including novels, short stories, and poetry'),
('Non-Fiction', 'Non-fiction books including biographies, history, and science'),
('Children', 'Books for children and young adults'),
('Academic', 'Textbooks and academic publications'),
('Magazines', 'Periodicals and magazines');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_category, is_public, description) VALUES 
('store_name', 'BookStore Management System', 'store', TRUE, 'Name of the bookstore'),
('tax_rate', '8.5', 'tax', TRUE, 'Default tax rate percentage'),
('currency', 'USD', 'store', TRUE, 'Default currency'),
('receipt_footer', 'Thank you for your purchase!', 'store', TRUE, 'Default receipt footer message'),
('low_stock_threshold', '10', 'inventory', FALSE, 'Threshold for low stock alerts'),
('max_discount_percent', '25', 'sales', FALSE, 'Maximum discount percentage allowed');

-- Insert default store details
INSERT INTO store_details (name, contact, website, address, email) VALUES 
('BookStore Management System', '+1-555-0123', 'https://bookstore.com', '123 Book Street, Reading City, RC 12345', 'info@bookstore.com');

-- Create views for reporting
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_sale
FROM sales 
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW top_selling_items AS
SELECT 
    i.name as item_name,
    c.name as category_name,
    SUM(si.quantity) as total_sold,
    SUM(si.total_price) as total_revenue
FROM sale_items si
JOIN items i ON si.item_id = i.id
LEFT JOIN categories c ON i.category_id = c.id
GROUP BY i.id, i.name, c.name
ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW low_stock_items AS
SELECT 
    i.name as item_name,
    c.name as category_name,
    i.stock as current_stock,
    i.sku
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
WHERE i.stock <= 10 AND i.is_active = TRUE
ORDER BY i.stock ASC;

-- Grant permissions (adjust as needed for your MySQL setup)
-- GRANT ALL PRIVILEGES ON bookstore_management.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

COMMIT; 