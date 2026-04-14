const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ROOT TEST
app.get("/", (req, res) => {
  res.send("VoxDigits backend is running ✅");
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// SAFE TOKEN ROUTE (NO TWILIO YET)
app.get("/api/twilio/token", (req, res) => {
  res.json({
    message: "Token route working",
    status: "OK"
  });
});

// PORT FIX FOR RAILWAY
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
