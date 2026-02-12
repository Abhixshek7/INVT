const pool = require('../config/db');

// Get reorder suggestions based on sales data and inventory levels
const getReorderSuggestions = async (req, res) => {
    try {
        const { days = 30 } = req.query; // Look ahead period in days

        // Get inventory items with sales data and calculate reorder suggestions
        const query = `
      WITH sales_stats AS (
        SELECT 
          sd.sku,
          COUNT(DISTINCT sd.date) as sales_days,
          AVG(sd.quantity) as avg_daily_quantity,
          MAX(sd.quantity) as max_daily_quantity,
          SUM(sd.quantity) as total_quantity,
          STDDEV(sd.quantity) as stddev_quantity
        FROM salesdata sd
        WHERE sd.date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY sd.sku
      ),
      inventory_with_stats AS (
        SELECT 
          i.*,
          ss.avg_daily_quantity,
          ss.max_daily_quantity,
          ss.total_quantity,
          ss.stddev_quantity,
          ss.sales_days,
          -- Calculate days until stockout based on average daily sales
          CASE 
            WHEN ss.avg_daily_quantity > 0 
            THEN FLOOR(i.stock / ss.avg_daily_quantity)
            ELSE 999
          END as days_until_stockout,
          -- Calculate suggested reorder quantity
          CASE 
            WHEN ss.avg_daily_quantity > 0 
            THEN GREATEST(
              CEIL((ss.avg_daily_quantity * $1) - i.stock),
              0
            )
            ELSE 0
          END as suggested_order_quantity,
          -- Calculate reorder priority score (0-100)
          CASE 
            WHEN ss.avg_daily_quantity > 0 
            THEN LEAST(100, GREATEST(0, 
              100 - (FLOOR(i.stock / ss.avg_daily_quantity) * 3)
            ))
            ELSE 0
          END as priority_score
        FROM inventory i
        LEFT JOIN sales_stats ss ON i.sku = ss.sku
      )
      SELECT 
        id,
        sku,
        name,
        category,
        stock,
        threshold,
        max_stock,
        status,
        supplier,
        COALESCE(avg_daily_quantity, 0) as avg_daily_sales,
        COALESCE(max_daily_quantity, 0) as max_daily_sales,
        COALESCE(total_quantity, 0) as total_sales_90d,
        COALESCE(stddev_quantity, 0) as sales_volatility,
        COALESCE(sales_days, 0) as active_sales_days,
        days_until_stockout,
        suggested_order_quantity,
        priority_score,
        -- Determine urgency level
        CASE 
          WHEN days_until_stockout <= 3 THEN 'critical'
          WHEN days_until_stockout <= 7 THEN 'urgent'
          WHEN days_until_stockout <= 14 THEN 'moderate'
          WHEN stock < threshold THEN 'low_stock'
          ELSE 'normal'
        END as urgency,
        -- Calculate estimated cost based on recent average
        CASE
          WHEN avg_daily_quantity > 0
          THEN suggested_order_quantity * 25.00  -- placeholder price, should come from suppliers
          ELSE 0
        END as estimated_cost
      FROM inventory_with_stats
      WHERE suggested_order_quantity > 0 
        OR stock < threshold
        OR days_until_stockout <= $1
      ORDER BY priority_score DESC, days_until_stockout ASC
    `;

        const result = await pool.query(query, [parseInt(days)]);

        // Calculate summary statistics
        const suggestions = result.rows;
        const summary = {
            total_items: suggestions.length,
            critical_items: suggestions.filter(s => s.urgency === 'critical').length,
            urgent_items: suggestions.filter(s => s.urgency === 'urgent').length,
            total_suggested_units: suggestions.reduce((sum, s) => sum + parseInt(s.suggested_order_quantity || 0), 0),
            total_estimated_cost: suggestions.reduce((sum, s) => sum + parseFloat(s.estimated_cost || 0), 0),
            avg_days_until_stockout: suggestions.length > 0
                ? suggestions.reduce((sum, s) => sum + parseInt(s.days_until_stockout || 0), 0) / suggestions.length
                : 0
        };

        res.json({
            summary,
            suggestions: result.rows
        });
    } catch (error) {
        console.error('Error calculating reorder suggestions:', error);
        res.status(500).json({ message: 'Server error while calculating reorder suggestions' });
    }
};

// Get top suppliers for reordering
const getSuggestedSuppliers = async (req, res) => {
    try {
        const query = `
      SELECT 
        s.id,
        s.name,
        s.rating,
        s.total_orders,
        s.status,
        s.email,
        s.phone,
        COUNT(DISTINCT i.id) as products_supplied
      FROM suppliers s
      LEFT JOIN inventory i ON i.supplier = s.name
      WHERE s.status = 'active'
      GROUP BY s.id
      ORDER BY s.rating DESC, s.total_orders DESC
      LIMIT 10
    `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching suggested suppliers:', error);
        res.status(500).json({ message: 'Server error while fetching suppliers' });
    }
};

module.exports = {
    getReorderSuggestions,
    getSuggestedSuppliers
};
