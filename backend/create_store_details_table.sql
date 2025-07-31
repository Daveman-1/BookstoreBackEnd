-- Create store_details table for storing store information
CREATE TABLE IF NOT EXISTS store_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Bookstore',
    contact VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    fax VARCHAR(50),
    email VARCHAR(255),
    tax_number VARCHAR(100),
    receipt_footer TEXT,
    logo LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default store details (only one row)
INSERT INTO store_details (name, contact, website, address, fax, email, tax_number, receipt_footer, logo) VALUES
('Bookstore', '', '', '', '', '', '', '', '')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    contact = VALUES(contact),
    website = VALUES(website),
    address = VALUES(address),
    fax = VALUES(fax),
    email = VALUES(email),
    tax_number = VALUES(tax_number),
    receipt_footer = VALUES(receipt_footer),
    logo = VALUES(logo);

-- Verify the table was created and populated
SELECT * FROM store_details; 