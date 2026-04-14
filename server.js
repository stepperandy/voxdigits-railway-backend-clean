const twilio = require("twilio");

app.get("/api/twilio/token", (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const appSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !appSid) {
      return res.status(500).json({ error: "Missing Twilio environment variables" });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const identity = "user_" + Math.floor(Math.random() * 100000);

    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    });

    token.addGrant(voiceGrant);

    res.json({
      token: token.toJwt(),
      identity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
