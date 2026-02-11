
-- Connect to the INVT database
\c "INVT";

-- Increase the timeout for large data generation
SET statement_timeout = 0;

DO $$
DECLARE
    v_product_count INT := 50; -- Number of products to generate
    v_sales_per_product INT := 300; -- Sales records per product
    v_start_date DATE := '2023-01-01';
    v_end_date DATE := CURRENT_DATE;
    v_sku VARCHAR;
    v_quantity INT;
    v_price DECIMAL(10, 2);
    v_total_records INT := 0;
    categories TEXT[] := ARRAY['Electronics', 'Fashion', 'Home & Garden', 'Automotive', 'Sports', 'Toys', 'Books', 'Beauty', 'Health', 'Groceries'];
    product_adj TEXT[] := ARRAY['Premium', 'Basic', 'Super', 'Ultra', 'Smart', 'Eco', 'Pro', 'Max', 'Mini', 'Portable'];
    product_noun TEXT[] := ARRAY['Widget', 'Gadget', 'Tool', 'Device', 'Appliance', 'Kit', 'Module', 'Unit', 'System', 'Monitor'];
    i INT;
    j INT;
BEGIN
    RAISE NOTICE 'Starting data generation...';

    -- 1. Generate Sample Inventory Products if they don't exist
    RAISE NOTICE 'Generating % inventory items...', v_product_count;
    
    FOR i IN 1..v_product_count LOOP
        INSERT INTO inventory (sku, name, category, stock, threshold, max_stock, status, supplier)
        VALUES (
            'SKU-' || lpad((i + 1000)::text, 6, '0'), -- Start from 1000 to avoid conflicts with existing small SKU numbers
            product_adj[1 + floor(random() * array_length(product_adj, 1))::int] || ' ' || product_noun[1 + floor(random() * array_length(product_noun, 1))::int] || ' ' || chr(65 + floor(random() * 26)::int) || i,
            categories[1 + floor(random() * array_length(categories, 1))::int],
            floor(random() * 150)::int,
            10,
            200,
            CASE WHEN random() > 0.8 THEN 'low_stock' ELSE 'good' END,
            'Supplier ' || chr(65 + floor(random() * 5)::int)
        )
        ON CONFLICT (sku) DO NOTHING;
    END LOOP;

    -- 2. Generate Sales Data
    RAISE NOTICE 'Generating sales records...';
    
    -- Iterate over all inventory items
    FOR v_sku IN SELECT sku FROM inventory LOOP
        -- Generate random number of sales for each product (between 200 and 400)
        FOR j IN 1..(v_sales_per_product + floor(random() * 100)::int) LOOP
             v_quantity := floor(random() * 50 + 1)::int; -- 1 to 50 items per sale
             v_price := (random() * 100 + 10)::numeric(10,2); -- Price between 10 and 110
             
             INSERT INTO salesdata (date, sku, quantity, revenue)
             VALUES (
                 v_start_date + (random() * (v_end_date - v_start_date))::int, -- Random date in range
                 v_sku,
                 v_quantity,
                 (v_quantity * v_price)::numeric(10,2)
             );
             v_total_records := v_total_records + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Data generation complete! Added % sales records.', v_total_records;

END $$;
