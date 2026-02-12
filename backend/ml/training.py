import pandas as pd
import os
import psycopg2
from model import forecaster
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            user=os.environ.get('DB_USER', 'postgres'),
            password=os.environ.get('DB_PASSWORD', 'postgres'),
            host=os.environ.get('DB_HOST', 'localhost'),
            port=os.environ.get('DB_PORT', '5432'),
            database=os.environ.get('DB_NAME', 'invt_db')
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None

def train_model(csv_path: str = "data/train.csv", auto_tune: bool = False):
    """
    Train the machine learning model using the singleton forecaster.
    Returns the evaluation metrics.
    """
    logger.info("[*] Starting Model Training Pipeline...")
    
    # 1. Fetch Holidays from DB (if table exists)
    holidays_df = None
    conn = get_db_connection()
    if conn:
        try:
            # Check if holidays table exists first
            cur = conn.cursor()
            cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'holidays';")
            if cur.fetchone():
                query = "SELECT date, description, transferred FROM holidays"
                df_holidays_db = pd.read_sql_query(query, conn)
                
                if not df_holidays_db.empty:
                    # Convert to Prophet format: ds, holiday
                    data = []
                    for _, row in df_holidays_db.iterrows():
                        data.append({
                            "ds": pd.to_datetime(row['date']),
                            "holiday": row['description'],
                            "lower_window": 0,
                            "upper_window": 1 if row['transferred'] else 0,
                        })
                    holidays_df = pd.DataFrame(data)
                    logger.info(f"[+] Loaded {len(holidays_df)} holidays from Database.")
            else:
                logger.warning("[!] 'holidays' table not found in database. Skipping holiday loading.")
            
            cur.close()
            conn.close()
        except Exception as e:
            logger.warning(f"[!] Failed to load holidays from DB: {e}")

    # Train
    # Assuming CSV path is relative to backend root if running from there
    abs_csv_path = os.path.abspath(csv_path)
    forecaster.train(csv_path=abs_csv_path, auto_tune=auto_tune, holidays_df=holidays_df)
    
    # Evaluate if trained successfully
    metrics = None
    if forecaster.is_trained:
        logger.info("[*] Evaluating model performance...")
        metrics = forecaster.evaluate()
        
    return metrics

if __name__ == "__main__":
    # If run directly
    import sys
    csv_file = sys.argv[1] if len(sys.argv) > 1 else "data/train.csv"
    tune = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else False
    
    metrics = train_model(csv_path=csv_file, auto_tune=tune)
    if metrics:
        print(f"Final Metrics: {metrics}")

