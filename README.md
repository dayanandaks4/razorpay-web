# PayFlow — Razorpay Payment App

A complete payment website with Razorpay integration, UPI QR support, and payment history.

## Features
- Pay with UPI QR Code (GPay, PhonePe, Paytm, etc.)
- Cards, Netbanking support
- Payment history page
- Signature verification (secure)
- Deploy-ready for Railway/Render/Vercel

---

## Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Razorpay keys
Edit the `.env` file:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_here
```
Get keys from: https://razorpay.com → Dashboard → Settings → API Keys

### 3. Run the server
```bash
npm start
```

Open http://localhost:3000 in your browser.

---

## Deploy to Railway (Free)

1. Push this folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo
4. Add Environment Variables in Railway dashboard:
   - `RAZORPAY_KEY_ID` = your key
   - `RAZORPAY_KEY_SECRET` = your secret
5. Done! Railway gives you a live URL.

---

## Test Payment Credentials (Test Mode)

| Method | Details |
|--------|---------|
| Card | 4111 1111 1111 1111 |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | 1234 |
| UPI | success@razorpay |

---

## Project Structure

```
razorpay-app/
├── server.js          ← Backend (Express + Razorpay)
├── public/
│   └── index.html     ← Frontend (Payment UI + History)
├── .env               ← Your API keys (never commit this!)
├── .gitignore
└── package.json
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /create-order | Creates Razorpay order |
| POST | /verify-payment | Verifies payment signature |
| GET | /payment-history | Returns all payments |
| GET | /health | Server status |
