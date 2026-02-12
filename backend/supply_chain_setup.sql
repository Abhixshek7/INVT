-- =================================================
-- Supply Chain Tables Setup
-- Tables: suppliers, warehouses, purchase_orders, shipments
-- =================================================

\c INVT;

-- =================================================
-- TABLE: suppliers
-- =================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    total_orders INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'pending'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- =================================================
-- TABLE: warehouses
-- =================================================
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    capacity INTEGER DEFAULT 0, -- Total capacity
    current_utilization INTEGER DEFAULT 0, -- Current stock level
    manager_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'operational', -- 'operational', 'maintenance', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);

-- =================================================
-- TABLE: purchase_orders
-- =================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    actual_delivery DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    total_items INTEGER DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_order_date ON purchase_orders(order_date);

-- =================================================
-- TABLE: purchase_order_items (line items for POs)
-- =================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku VARCHAR(50) REFERENCES inventory(sku) ON DELETE SET NULL,
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_sku ON purchase_order_items(sku);

-- =================================================
-- TABLE: shipments
-- =================================================
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL,
    origin_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    destination_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    carrier VARCHAR(255),
    shipping_method VARCHAR(100), -- 'air', 'sea', 'road', 'rail'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_transit', 'delivered', 'delayed', 'cancelled'
    ship_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    total_weight DECIMAL(10, 2), -- in kg
    total_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_po ON shipments(po_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- =================================================
-- SAMPLE DATA: suppliers
-- =================================================
INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, rating, total_orders, status)
VALUES 
    ('Farm Fresh Co.', 'John Smith', 'john@farmfresh.com', '+1-555-0101', '123 Farm Road', 'Portland', 'USA', 4.5, 145, 'active'),
    ('Bakers Best', 'Sarah Johnson', 'sarah@bakersbest.com', '+1-555-0102', '456 Bakery Lane', 'Seattle', 'USA', 4.8, 98, 'active'),
    ('Citrus Suppliers', 'Mike Chen', 'mike@citrussuppliers.com', '+1-555-0103', '789 Orange Grove', 'Miami', 'USA', 4.2, 76, 'active'),
    ('Sweet Treats Ltd', 'Emma Wilson', 'emma@sweettreats.com', '+1-555-0104', '321 Candy Street', 'Chicago', 'USA', 4.6, 112, 'active'),
    ('Global Foods Inc', 'David Brown', 'david@globalfoods.com', '+1-555-0105', '654 Trade Plaza', 'New York', 'USA', 4.0, 203, 'active'),
    ('Local Produce Co', 'Lisa Martinez', 'lisa@localproduce.com', '+1-555-0106', '987 Market Square', 'Austin', 'USA', 4.7, 67, 'active')
ON CONFLICT DO NOTHING;

-- =================================================
-- SAMPLE DATA: warehouses
-- =================================================
INSERT INTO warehouses (name, code, location, address, city, country, capacity, current_utilization, manager_name, contact_email, contact_phone, status)
VALUES 
    ('Main Distribution Center', 'WH-001', 'North District', '1000 Warehouse Blvd', 'Portland', 'USA', 50000, 35000, 'Robert Taylor', 'robert@invt.com', '+1-555-0201', 'operational'),
    ('East Coast Hub', 'WH-002', 'East District', '2000 Logistics Ave', 'New York', 'USA', 40000, 28000, 'Jennifer Lee', 'jennifer@invt.com', '+1-555-0202', 'operational'),
    ('West Coast Facility', 'WH-003', 'West District', '3000 Supply Chain Dr', 'Los Angeles', 'USA', 45000, 32000, 'Michael Chang', 'michael@invt.com', '+1-555-0203', 'operational'),
    ('Central Warehouse', 'WH-004', 'Central District', '4000 Storage Way', 'Chicago', 'USA', 35000, 22000, 'Amanda White', 'amanda@invt.com', '+1-555-0204', 'operational'),
    ('South Regional Hub', 'WH-005', 'South District', '5000 Depot Lane', 'Houston', 'USA', 30000, 18000, 'Carlos Rodriguez', 'carlos@invt.com', '+1-555-0205', 'maintenance')
ON CONFLICT (code) DO NOTHING;

-- =================================================
-- SAMPLE DATA: purchase_orders
-- =================================================
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery, actual_delivery, status, total_items, total_amount, notes)
VALUES 
    ('PO-2026-001', 1, 1, '2026-02-01', '2026-02-10', NULL, 'confirmed', 500, 12500.00, 'Bulk order for dairy products'),
    ('PO-2026-002', 2, 2, '2026-02-03', '2026-02-12', NULL, 'shipped', 300, 8400.00, 'Fresh bakery items'),
    ('PO-2026-003', 3, 1, '2026-02-05', '2026-02-15', NULL, 'pending', 400, 9600.00, 'Citrus fruits seasonal order'),
    ('PO-2026-004', 4, 3, '2026-01-28', '2026-02-07', '2026-02-08', 'delivered', 250, 7500.00, 'Chocolate and confectionery'),
    ('PO-2026-005', 5, 4, '2026-02-08', '2026-02-20', NULL, 'confirmed', 600, 18000.00, 'Mixed grocery items'),
    ('PO-2026-006', 6, 1, '2026-02-10', '2026-02-18', NULL, 'pending', 350, 10500.00, 'Local organic produce'),
    ('PO-2026-007', 1, 2, '2026-02-06', '2026-02-14', NULL, 'shipped', 450, 11250.00, 'Dairy restock'),
    ('PO-2026-008', 3, 3, '2026-01-25', '2026-02-03', '2026-02-04', 'delivered', 200, 6400.00, 'Orange juice concentrate')
ON CONFLICT (po_number) DO NOTHING;

-- =================================================
-- SAMPLE DATA: purchase_order_items
-- =================================================
INSERT INTO purchase_order_items (po_id, sku, product_name, quantity, unit_price, received_quantity)
VALUES 
    (1, 'SKU-001234', 'Organic Milk 1L', 200, 25.00, 200),
    (1, 'SKU-003456', 'Fresh Eggs (12pk)', 300, 35.00, 300),
    (2, 'SKU-002345', 'Whole Wheat Bread', 300, 28.00, 250),
    (3, 'SKU-004567', 'Orange Juice 1L', 400, 24.00, 0),
    (4, 'SKU-005678', 'Chocolate Bar', 250, 30.00, 250),
    (5, 'SKU-001234', 'Organic Milk 1L', 300, 25.00, 300),
    (5, 'SKU-004567', 'Orange Juice 1L', 300, 30.00, 300)
ON CONFLICT DO NOTHING;

-- =================================================
-- SAMPLE DATA: shipments
-- =================================================
INSERT INTO shipments (tracking_number, po_id, origin_warehouse_id, destination_warehouse_id, carrier, shipping_method, status, ship_date, expected_delivery, actual_delivery, total_weight, total_cost)
VALUES 
    ('TRK-2026-001', 1, NULL, 1, 'FastShip Logistics', 'road', 'in_transit', '2026-02-05', '2026-02-10', NULL, 5000.00, 850.00),
    ('TRK-2026-002', 2, NULL, 2, 'Express Carriers', 'air', 'in_transit', '2026-02-08', '2026-02-12', NULL, 2500.00, 1200.00),
    ('TRK-2026-003', 4, NULL, 3, 'Ground Transport Co', 'road', 'delivered', '2026-02-02', '2026-02-07', '2026-02-08', 3500.00, 650.00),
    ('TRK-2026-004', 7, NULL, 2, 'FastShip Logistics', 'road', 'in_transit', '2026-02-10', '2026-02-14', NULL, 4200.00, 780.00),
    ('TRK-2026-005', 8, NULL, 3, 'Ocean Freight Inc', 'sea', 'delivered', '2026-01-28', '2026-02-03', '2026-02-04', 6000.00, 450.00),
    ('TRK-2026-006', 3, NULL, 1, 'Express Carriers', 'air', 'pending', '2026-02-12', '2026-02-15', NULL, 3800.00, 1100.00)
ON CONFLICT (tracking_number) DO NOTHING;

-- =================================================
-- Supply chain setup complete!
-- =================================================
SELECT 'Supply chain tables and data created successfully!' AS message;
