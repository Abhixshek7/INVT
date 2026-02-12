# 🔐 Authenticated API Usage Guide

## Authentication Re-enabled ✅

The forecast endpoints now require authentication tokens.

---

## How to Use Authenticated Endpoints

### Step 1: Create a User (if you don't have one)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"first_name\":\"Test\",\"last_name\":\"User\"}"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Step 2: Login to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "user"
  }
}
```

**Copy this token!**

---

### Step 3: Use Token for Forecast Endpoints

#### Get Predictions (with token)

```bash
curl "http://localhost:5000/api/forecast?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Alternative header format:**
```bash
curl "http://localhost:5000/api/forecast?days=30" \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

#### Train Model (with token)

```bash
curl -X POST http://localhost:5000/api/forecast/train \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Frontend Usage

### JavaScript/TypeScript

```javascript
// Store token after login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// Use token for forecast requests
const forecastResponse = await fetch('http://localhost:5000/api/forecast?days=30', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const forecastData = await forecastResponse.json();
console.log(forecastData.predictions);
```

### React Example with Axios

```javascript
import axios from 'axios';

// Set default auth header
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Get predictions
const { data } = await axios.get('http://localhost:5000/api/forecast?days=30');
console.log(data.summary);
```

---

## Error Responses

### No Token Provided
```json
{
  "msg": "No token, authorization denied"
}
```
**Status:** 401 Unauthorized

### Invalid Token
```json
{
  "msg": "Token is not valid"
}
```
**Status:** 401 Unauthorized

### Expired Token
```json
{
  "msg": "Token is not valid"
}
```
**Status:** 401 Unauthorized

---

## Available Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/signup` | POST | ❌ No | Create new user |
| `/api/auth/login` | POST | ❌ No | Login and get token |
| `/api/auth/me` | GET | ✅ Yes | Get current user info |
| `/api/forecast` | GET | ✅ Yes | Get predictions |
| `/api/forecast/train` | POST | ✅ Yes | Train ML model |

---

## Quick Test Commands

```bash
# 1. Create user and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@invt.com","password":"admin123","first_name":"Admin","last_name":"User"}' \
  | jq -r '.token')

# 2. Use token to get forecast
curl "http://localhost:5000/api/forecast?days=30" \
  -H "Authorization: Bearer $TOKEN"

# 3. Train model (admin only in future)
curl -X POST http://localhost:5000/api/forecast/train \
  -H "Authorization: Bearer $TOKEN"
```

---

## Token Expiration

Tokens are valid for **24 hours** by default. After expiration, you need to login again to get a new token.

---

## Security Best Practices

✅ Store tokens securely (localStorage for web, SecureStore for mobile)  
✅ Always use HTTPS in production  
✅ Never commit tokens to version control  
✅ Implement token refresh mechanism for long sessions  
✅ Clear token on logout  

---

**Authentication is now ENABLED for forecast endpoints! 🔐**
