require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ─── In-memory payment history (use a database in production) ───
const paymentHistory = [];

// ─── Razorpay instance ───
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── ROUTE: Serve homepage ───
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── ROUTE: Create Razorpay Order ───
app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", name, description } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Amount must be at least ₹1" });
    }

    const options = {
      amount: Math.round(amount * 100), // convert ₹ to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        description: description || "Payment",
        customer_name: name || "Customer",
      },
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order created:", order.id);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    res.status(500).json({ error: "Failed to create order. Check your API keys." });
  }
});

// ─── ROUTE: Verify Payment After Success ───
app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, name, description } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed!" });
    }

    // Save to history
    const payment = {
      id: paymentHistory.length + 1,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: amount / 100, // convert paise back to ₹
      currency: "INR",
      name: name || "Customer",
      description: description || "Payment",
      status: "Success",
      timestamp: new Date().toISOString(),
    };

    paymentHistory.unshift(payment); // newest first
    console.log("✅ Payment verified and saved:", razorpay_payment_id);

    res.json({ success: true, message: "Payment successful!", payment });
  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ success: false, message: "Verification error" });
  }
});

// ─── ROUTE: Get Payment History ───
app.get("/payment-history", (req, res) => {
  res.json({ payments: paymentHistory, total: paymentHistory.length });
});

// ─── ROUTE: Health check ───
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    razorpay_configured: !!process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== "rzp_test_XXXXXXXXXXXXXXXX",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Razorpay Key: ${process.env.RAZORPAY_KEY_ID}`);
  console.log(`💡 Open http://localhost:${PORT} in your browser\n`);
});
