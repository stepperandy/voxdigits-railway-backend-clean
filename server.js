const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Root test
app.get("/", (req, res) => {
  res.send("CLEAN BACKEND OK");
});

// Twilio Voice Webhook
app.post("/api/twilio/voice", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice">Welcome to VoxDigits. Your system is working.</Say>
    </Response>
  `);
});

// Twilio SMS Webhook
app.post("/api/twilio/sms", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>SMS received successfully on VoxDigits</Message>
    </Response>
  `);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
