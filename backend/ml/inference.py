import pandas as pd
from model import forecaster
from typing import List, Dict, Optional
import json
import sys

def load_model():
    """
    Ensure the singleton model is loaded.
    """
    return forecaster.load_model()

def predict_demand(days: int = 30, future_promotions: Optional[List[int]] = None) -> List[Dict]:
    """
    Generate sales forecasts using the trained singleton model.
    """
    if not forecaster.is_trained:
        if not load_model():
            return {"error": "Model not trained or found"}
            
    return forecaster.predict(days=days, future_promotions=future_promotions)
    
def get_components(days: int = 30) -> Dict:
    """
    Get trend and seasonality components.
    """
    return forecaster.get_model_components(days=days)

if __name__ == "__main__":
    # CLI Usage: python inference.py [days]
    try:
        days = int(sys.argv[1]) if len(sys.argv) > 1 else 30
        
        # Check if we want components or forecast
        mode = sys.argv[2] if len(sys.argv) > 2 else "forecast"
        
        if mode == "components":
            result = get_components(days)
        else:
            result = predict_demand(days)
            
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
