// API Service for Forecast endpoints
const API_BASE_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`}/api`;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export interface ForecastPrediction {
    date: string;
    predicted_quantity: number;
    lower_bound: number;
    upper_bound: number;
    confidence_interval: number;
    trend: number;
    uncertainty_percentage: number;
}

export interface ForecastSummary {
    total_predictions: number;
    average_predicted_quantity: number;
    min_predicted: number;
    max_predicted: number;
    total_forecasted_quantity: number;
}

export interface ForecastResponse {
    predictions: ForecastPrediction[];
    summary: ForecastSummary;
}

export const forecastService = {
    /**
     * Get demand forecast for specified number of days
     * @param days - Number of days to forecast (default: 30)
     */
    async getForecast(days: number = 30): Promise<ForecastResponse> {
        const response = await fetch(
            `${API_BASE_URL}/forecast?days=${days}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || error.error || 'Failed to fetch forecast');
        }

        return response.json();
    },

    /**
     * Train the ML model with new data
     */
    async trainModel(): Promise<{ message: string; output: string }> {
        const response = await fetch(`${API_BASE_URL}/forecast/train`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || error.error || 'Failed to train model');
        }

        return response.json();
    },
};
