CREATE DATABASE invt_db;


CREATE TABLE inventory (
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

CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);

INSERT INTO inventory (sku, name, category, stock, threshold, max_stock, status, supplier, last_updated)
VALUES 
('SKU-001234', 'Organic Milk 1L', 'Dairy', 12, 50, 200, 'critical', 'Farm Fresh Co.', NOW()),
('SKU-002345', 'Whole Wheat Bread', 'Bakery', 18, 40, 150, 'critical', 'Bakers Best', NOW()),
('SKU-003456', 'Fresh Eggs (12pk)', 'Dairy', 85, 60, 200, 'good', 'Farm Fresh Co.', NOW());
