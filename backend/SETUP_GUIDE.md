# 🚀 INVT Backend Setup Guide

## Prerequisites
- ✅ PostgreSQL installed and running
- ✅ Node.js installed
- ✅ Python 3.x installed

---

## Step 1: Database Setup ✅ (COMPLETED)

Your database should now have:
- Database name: **INVT**
- Username: **postgres**
- Password: **root**
- Tables: users, inventory, salesdata, holidays

**Verify database:**
```bash
psql -U postgres -d INVT -c "\dt"
```

---

## Step 2: Install Python Dependencies

```bash
cd d:\Projects\INVT\backend\ml
pip install -r requirements.txt
```

**This installs:**
- prophet (ML forecasting library)
- pandas (data processing)
- psycopg2-binary (PostgreSQL connector)

---

## Step 3: Install Node.js Dependencies

```bash
cd d:\Projects\INVT\backend
npm install
```

---

## Step 4: Verify Environment Variables

Check `.env` file has these settings:
```
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=INVT
DB_HOST=localhost
DB_PORT=5432
PORT=5000
```

---

## Step 5: Start the Backend Server

```bash
cd d:\Projects\INVT\backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000
```

**Keep this terminal open!**

---

## Step 6: Test Database Connection

Open a **NEW terminal** and run:

```bash
curl http://localhost:5000/test-db
```

**Expected response:**
```json
{"message": "Database connected successfully", "time": "..."}
```

---

## Step 7: Train the ML Model (First Time)

```bash
curl -X POST http://localhost:5000/api/forecast/train
```

**What happens:**
- Loads data from `data/train.csv` (1000 rows of sales data)
- Fetches holidays from database
- Trains Prophet model (takes 2-5 minutes)
- Saves model as `prophet_model.joblib`

**Expected output:**
```json
{
  "message": "Training completed",
  "output": "🚀 Starting Model Training Pipeline...\n✅ Model trained and saved successfully."
}
```

**⏰ This will take 2-5 minutes. Be patient!**

---

## Step 8: Test Predictions

After training completes:

```bash
# Get 30-day forecast
curl "http://localhost:5000/api/forecast?days=30"
```

**Expected response:**
```json
[
  {
    "ds": "2026-02-12T00:00:00.000Z",
    "yhat": 75.34,
    "yhat_lower": 65.21,
    "yhat_upper": 85.47
  },
  ...
]
```

---

## Step 9: Verify Model File Created

```bash
dir d:\Projects\INVT\backend\ml\prophet_model.joblib
```

Should show the model file (several MB in size).

---

## 🎯 Quick Summary

```bash
# Terminal 1: Start backend
cd d:\Projects\INVT\backend
npm run dev

# Terminal 2: Train model (first time only)
curl -X POST http://localhost:5000/api/forecast/train

# Terminal 2: Get predictions (anytime)
curl "http://localhost:5000/api/forecast?days=30"
```

---

## 🐛 Troubleshooting

### Problem: "python not found"
**Solution:** 
```bash
python --version  # Check if installed
# If not, install Python 3.x
```

### Problem: "ModuleNotFoundError: prophet"
**Solution:**
```bash
cd d:\Projects\INVT\backend\ml
pip install -r requirements.txt
```

### Problem: "Database connection failed"
**Solution:**
```bash
# Check PostgreSQL is running
# Verify .env has correct credentials
psql -U postgres -d INVT  # Test connection manually
```

### Problem: "Model not trained or found"
**Solution:**
```bash
# Train the model first
curl -X POST http://localhost:5000/api/forecast/train
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/test-db` | GET | Test database connection |
| `/api/forecast` | GET | Get predictions (requires trained model) |
| `/api/forecast/train` | POST | Train the model |
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |

---

## 🔄 Re-training the Model

You should re-train when you have new data:

1. Add new sales data to `data/train.csv` or database
2. Run: `curl -X POST http://localhost:5000/api/forecast/train`
3. Model will be updated with new patterns

---

## ✅ Success Checklist

- [ ] PostgreSQL database created
- [ ] Python dependencies installed
- [ ] Node.js dependencies installed
- [ ] Backend server running on port 5000
- [ ] Database connection test passed
- [ ] ML model trained successfully
- [ ] Predictions working

---

**You're all set! 🎉**
