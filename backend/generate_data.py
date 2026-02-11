import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_csv(filename="data/train.csv", n_entries=1000):
    print(f"Generating {n_entries} rows of dummy data...")
    
    # Start date from 2 years ago
    start_date = datetime.now() - timedelta(days=n_entries)
    dates = [start_date + timedelta(days=i) for i in range(n_entries)]
    
    data = []
    
    # Generate data with some seasonality and trend
    for i, date in enumerate(dates):
        # Base trend
        trend = i * 0.05
        
        # Weekly seasonality (higher on weekends)
        weekday = date.weekday()
        seasonality = 10 if weekday >= 5 else 0
        
        # Yearly seasonality (sine wave)
        day_of_year = date.timetuple().tm_yday
        yearly = 20 * np.sin(2 * np.pi * day_of_year / 365)
        
        # Random noise
        noise = np.random.normal(0, 5)
        
        # Promotion effect
        is_promo = 1 if np.random.random() > 0.9 else 0
        promo_effect = 30 if is_promo else 0
        
        # Calculate quantity (ensure non-negative)
        quantity = max(0, int(50 + trend + seasonality + yearly + promo_effect + noise))
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "quantity": quantity,
            "onpromotion": is_promo,
            "sku": "SKU-001234" # Adding SKU just in case, though current model aggregates
        })
        
    df = pd.DataFrame(data)
    
    # Ensure directory exists
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    df.to_csv(filename, index=False)
    print(f"✅ Successfully created {filename} with columns: {list(df.columns)}")
    print(df.head())

if __name__ == "__main__":
    generate_csv()
