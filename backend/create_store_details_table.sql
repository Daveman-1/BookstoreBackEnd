-- Create store_details table for storing store information (PostgreSQL)
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

-- Create function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_store_details_updated_at 
    BEFORE UPDATE ON store_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default store details (only one row)
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

-- Verify the table was created and populated
SELECT * FROM store_details; 