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
app.get("/api/twilio/token", (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const appSid = process.env.TWIML_APP_SID;

    if (!accountSid) {
      return res.status(500).json({ error: "Missing TWILIO_ACCOUNT_SID" });
    }
    if (!apiKey) {
      return res.status(500).json({ error: "Missing TWILIO_API_KEY" });
    }
    if (!apiSecret) {
      return res.status(500).json({ error: "Missing TWILIO_API_SECRET" });
    }
    if (!appSid) {
      return res.status(500).json({ error: "Missing TWIML_APP_SID" });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: "user"
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    });

    token.addGrant(voiceGrant);

    return res.json({
      ok: true,
      token: token.toJwt()
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});
