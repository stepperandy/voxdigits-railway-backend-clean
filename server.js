require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio credentials
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWIML_APP_SID,
  TWILIO_CALLER_ID,
  FRONTEND_URL,
} = process.env;

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL ? [FRONTEND_URL] : true,
    credentials: true,
  })
);

// Twilio sends webhooks as x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Basic startup checks
function requireEnv(name, value) {
  if (!value) {
    console.error(Missing required env var: ${name});
    process.exit(1);
  }
}

requireEnv("TWILIO_ACCOUNT_SID", TWILIO_ACCOUNT_SID);
requireEnv("TWILIO_API_KEY", TWILIO_API_KEY);
requireEnv("TWILIO_API_SECRET", TWILIO_API_SECRET);
requireEnv("TWIML_APP_SID", TWIML_APP_SID);
requireEnv("TWILIO_CALLER_ID", TWILIO_CALLER_ID);

// Health route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "VoxDigits backend is running",
  });
});

// Generate Twilio Voice token for frontend/app
app.get("/generateToken", (req, res) => {
  try {
    const identity =
      req.query.identity ||
      user_${Date.now()};

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET,
      { identity }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    res.json({
      ok: true,
      identity,
      token: token.toJwt(),
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to generate token",
      details: error.message,
    });
  }
});

// Outbound call webhook
// Twilio Voice SDK hits this through your TwiML App Voice URL
app.post("/voice", (req, res) => {
  try {
    const to = req.body.To || req.body.to;
    const from = TWILIO_CALLER_ID;

    console.log("Outbound /voice webhook hit");
    console.log("Body:", req.body);

    const twiml = new twilio.twiml.VoiceResponse();

    if (!to) {
      twiml.say("No destination number was provided.");
      return res.type("text/xml").send(twiml.toString());
    }

    // Optional: basic E.164 cleanup
    const cleanedTo = String(to).trim();

    const dial = twiml.dial({
      callerId: from,
      answerOnBridge: true,
      timeout: 30,
      record: "do-not-record",
      action: "/call-complete",
      method: "POST",
    });

    dial.number(
      {
        statusCallback: "/status",
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      },
      cleanedTo
    );

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Voice webhook error:", error);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Application error. Please try again later.");
    res.type("text/xml").send(twiml.toString());
  }
});

// Inbound call route
// Set your Twilio phone number webhook to this URL
app.post("/incoming", (req, res) => {
  try {
    console.log("Inbound /incoming webhook hit");
    console.log("Body:", req.body);

    const twiml = new twilio.twiml.VoiceResponse();

    // Simple example: forward inbound calls to your app client identity
    // Change "voxdigits_user" to your real client identity if needed
    const dial = twiml.dial({
      answerOnBridge: true,
      timeout: 20,
    });

    dial.client("voxdigits_user");

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Incoming webhook error:", error);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Unable to connect your call right now.");
    res.type("text/xml").send(twiml.toString());
  }
});

// Dial action callback after the dial attempt finishes
app.post("/call-complete", (req, res) => {
  console.log("Call complete callback:", req.body);

  const twiml = new twilio.twiml.VoiceResponse();
  res.type("text/xml").send(twiml.toString());
});

// Status callback
app.post("/status", (req, res) => {
  console.log("Call status update:", req.body);
  res.sendStatus(200);
});

// 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(VoxDigits backend running on port ${PORT});
});
