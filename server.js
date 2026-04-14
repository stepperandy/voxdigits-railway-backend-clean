const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express(); // ✅ THIS WAS MISSING

app.use(cors());
app.use(express.json());

// Root test
app.get("/", (req, res) => {
  res.send("CLEAN BACKEND OK");
});

// Voice webhook
app.post("/api/twilio/voice", (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say("Welcome to VoxDigits. Your system is working.");

  res.type("text/xml");
  res.send(response.toString());
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
