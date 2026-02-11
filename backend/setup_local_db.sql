-- =================================================
-- INVT Database Setup Script
-- Database: INVT
-- User: postgres
-- Password: root
-- =================================================

-- Step 1: Create the database (run this as superuser)
-- DROP DATABASE IF EXISTS "INVT";
CREATE DATABASE "INVT";

-- Step 2: Connect to the INVT database
\c INVT;

-- =================================================
-- TABLE: users
-- =================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Nullable for Google Auth users
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'analyst', 'warehouse'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =================================================
-- TABLE: inventory
-- =================================================
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    threshold INTEGER DEFAULT 10,
    max_stock INTEGER DEFAULT 100,
    status VARCHAR(50),
    supplier VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- TABLE: salesdata (for ML training)
-- =================================================
CREATE TABLE IF NOT EXISTS salesdata (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    sku VARCHAR(50),
    quantity INTEGER NOT NULL,
    revenue DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salesdata_date ON salesdata(date);
CREATE INDEX IF NOT EXISTS idx_salesdata_sku ON salesdata(sku);

-- =================================================
-- TABLE: holidays (for Prophet model)
-- =================================================
CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    transferred BOOLEAN DEFAULT FALSE,
    locale VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);

-- =================================================
-- SAMPLE DATA: inventory
-- =================================================
INSERT INTO inventory (sku, name, category, stock, threshold, max_stock, status, supplier, last_updated)
VALUES 
    ('SKU-001234', 'Organic Milk 1L', 'Dairy', 12, 50, 200, 'critical', 'Farm Fresh Co.', NOW()),
    ('SKU-002345', 'Whole Wheat Bread', 'Bakery', 18, 40, 150, 'critical', 'Bakers Best', NOW()),
    ('SKU-003456', 'Fresh Eggs (12pk)', 'Dairy', 85, 60, 200, 'good', 'Farm Fresh Co.', NOW()),
    ('SKU-004567', 'Orange Juice 1L', 'Beverages', 45, 30, 120, 'good', 'Citrus Suppliers', NOW()),
    ('SKU-005678', 'Chocolate Bar', 'Snacks', 150, 100, 500, 'good', 'Sweet Treats Ltd', NOW())
ON CONFLICT (sku) DO NOTHING;

-- =================================================
-- SAMPLE DATA: holidays (US holidays for 2024-2026)
-- =================================================
INSERT INTO holidays (date, description, transferred, locale)
VALUES 
    ('2024-01-01', 'New Year Day', FALSE, 'US'),
    ('2024-07-04', 'Independence Day', FALSE, 'US'),
    ('2024-12-25', 'Christmas Day', FALSE, 'US'),
    ('2025-01-01', 'New Year Day', FALSE, 'US'),
    ('2025-07-04', 'Independence Day', FALSE, 'US'),
    ('2025-12-25', 'Christmas Day', FALSE, 'US'),
    ('2026-01-01', 'New Year Day', FALSE, 'US'),
    ('2026-07-04', 'Independence Day', FALSE, 'US'),
    ('2026-12-25', 'Christmas Day', FALSE, 'US')
ON CONFLICT DO NOTHING;

-- =================================================
-- Database setup complete!
-- =================================================
SELECT 'Database INVT created successfully!' AS message;
