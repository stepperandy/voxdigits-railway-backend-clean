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
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity: "user" }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);

  res.send({ token: token.toJwt() });
});
