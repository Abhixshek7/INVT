const pool = require('../config/db');

// Get high-level stats for dashboard cards
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Inventory items
        const totalItemsQuery = await pool.query('SELECT COUNT(*) FROM inventory');
        const totalItems = parseInt(totalItemsQuery.rows[0].count);

        // 2. Low Stock Count
        const lowStockQuery = await pool.query('SELECT COUNT(*) FROM inventory WHERE stock <= threshold');
        const lowStockCount = parseInt(lowStockQuery.rows[0].count);

        // 3. Out of Stock Count
        const outOfStockQuery = await pool.query('SELECT COUNT(*) FROM inventory WHERE stock = 0');
        const outOfStockCount = parseInt(outOfStockQuery.rows[0].count);

        // 4. Total Stock Value (Value of current inventory)
        // Assuming we might have cost, but for now we don't have price in inventory table, 
        // using a placeholder or if price was generated in sales we can estimate.
        // Actually, we don't have price in inventory, only in salesdata history. 
        // Let's estimate value based on average sales price per SKU * current stock.
        const stockValueQuery = await pool.query(`
            WITH avg_prices AS (
                SELECT sku, AVG(revenue / NULLIF(quantity, 0)) as avg_price 
                FROM salesdata 
                GROUP BY sku
            )
            SELECT SUM(i.stock * COALESCE(ap.avg_price, 0)) as total_value
            FROM inventory i
            LEFT JOIN avg_prices ap ON i.sku = ap.sku
        `);
        const totalStockValue = parseFloat(stockValueQuery.rows[0].total_value || 0).toFixed(2);

        // 5. Total Revenue (All time or this month) -> All time for now
        const revenueQuery = await pool.query('SELECT SUM(revenue) FROM salesdata');
        const totalRevenue = parseFloat(revenueQuery.rows[0].sum || 0).toFixed(2);

        res.json({
            totalItems,
            lowStockCount,
            outOfStockCount,
            totalStockValue,
            totalRevenue
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Top Moving Products (by quantity sold in last 30 days)
const getTopMovingProducts = async (req, res) => {
    try {
        const query = `
            SELECT i.name, i.category, i.stock, SUM(s.quantity) as sold_last_30_days, SUM(s.revenue) as revenue
            FROM inventory i
            JOIN salesdata s ON i.sku = s.sku
            WHERE s.date >= NOW() - INTERVAL '30 days'
            GROUP BY i.sku, i.name, i.category, i.stock
            ORDER BY sold_last_30_days DESC
            LIMIT 5
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Sales Trend (Daily revenue for last 30 days)
const getSalesTrend = async (req, res) => {
    try {
        const query = `
            SELECT date, SUM(revenue) as revenue, SUM(quantity) as quantity
            FROM salesdata
            WHERE date >= NOW() - INTERVAL '30 days'
            GROUP BY date
            ORDER BY date ASC
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get recent transactions/activity
const getRecentActivity = async (req, res) => {
    try {
        const query = `
            SELECT s.date, i.name, s.quantity, s.revenue
            FROM salesdata s
            JOIN inventory i ON s.sku = i.sku
            ORDER BY s.date DESC, s.created_at DESC
            LIMIT 10
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Low Stock Items (for alerts)
const getLowStockItems = async (req, res) => {
    try {
        const query = `
            SELECT id, sku, name, category, stock as "currentStock", threshold, status
            FROM inventory
            WHERE stock <= threshold
            ORDER BY stock ASC
            LIMIT 5
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Analytics Metrics
const getAnalytics = async (req, res) => {
    try {
        // 1. Turnover Ratio (Total Sales Quantity / Avg Stock)
        // Let's simplify: Total Quantity Sold in last 30 days / Average current stock
        const turnoverQuery = await pool.query(`
            WITH total_sold AS (
                SELECT SUM(quantity) as sold FROM salesdata WHERE date >= NOW() - INTERVAL '30 days'
            ),
            avg_stock AS (
                SELECT AVG(stock) as avg_s FROM inventory
            )
            SELECT (ts.sold / NULLIF(as_stock.avg_s, 0)) as turnover
            FROM total_sold ts, avg_stock as_stock
        `);
        const turnoverRatio = parseFloat(turnoverQuery.rows[0].turnover || 0).toFixed(1);

        // 2. Service Level (Placeholder or calculated: % of items NOT out of stock)
        const serviceLevelQuery = await pool.query(`
            SELECT 
                (100 - (COUNT(CASE WHEN stock = 0 THEN 1 END) * 100.0 / COUNT(*))) as service_level
            FROM inventory
        `);
        const serviceLevel = parseFloat(serviceLevelQuery.rows[0].service_level || 100).toFixed(1);

        // 3. Avg Days in Stock (Inventory / Daily Sales)
        const avgDaysQuery = await pool.query(`
            WITH daily_sales AS (
                SELECT SUM(quantity) / 30.0 as avg_daily_sales
                FROM salesdata
                WHERE date >= NOW() - INTERVAL '30 days'
            ),
            total_stock AS (
                SELECT SUM(stock) as total_s FROM inventory
            )
            SELECT (ts.total_s / NULLIF(ds.avg_daily_sales, 0)) as avg_days
            FROM total_stock ts, daily_sales ds
        `);
        const avgDaysInStock = parseFloat(avgDaysQuery.rows[0].avg_days || 0).toFixed(1);

        res.json({
            turnoverRatio,
            serviceLevel,
            avgDaysInStock,
            forecastAccuracy: '92.4' // Mocked for now as it requires complex historical comparison
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get dynamic system notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = [];

        // 1. Check for Out of Stock
        const outOfStockQuery = await pool.query('SELECT name, sku FROM inventory WHERE stock = 0 LIMIT 3');
        outOfStockQuery.rows.forEach(item => {
            notifications.push({
                id: `oos-${item.sku}`,
                message: `CRITICAL: ${item.name} (${item.sku}) is out of stock. Immediate reorder required.`,
                timestamp: 'Just Now',
                isRead: false,
                isFavorite: false,
                isArchived: false,
                type: 'critical'
            });
        });

        // 2. Check for Low Stock
        const lowStockQuery = await pool.query('SELECT name, sku FROM inventory WHERE stock <= threshold AND stock > 0 LIMIT 3');
        lowStockQuery.rows.forEach(item => {
            notifications.push({
                id: `low-${item.sku}`,
                message: `Warning: ${item.name} stock level is below threshold.`,
                timestamp: '15 min ago',
                isRead: false,
                isFavorite: false,
                isArchived: false,
                type: 'warning'
            });
        });

        // 3. System messages
        notifications.push({
            id: 'sys-1',
            message: 'ML Model training completed successfully using recent sales data.',
            timestamp: '1 hour ago',
            isRead: true,
            isFavorite: false,
            isArchived: false,
            type: 'info'
        });

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getDashboardStats,
    getTopMovingProducts,
    getSalesTrend,
    getRecentActivity,
    getLowStockItems,
    getAnalytics,
    getNotifications
};
