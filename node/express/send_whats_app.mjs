// twilio-send.js
import express from "express";
import twilio from "twilio";

const app = express();
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioWhatsAppFrom = "whatsapp:+14155238886"; // Twilio sandbox number (example)

app.post("/send-twilio", async (req, res) => {
  const { to, body } = req.body; // to must be "whatsapp:+91xxxxxxxxxx"
  if (!to || !body) return res.status(400).send("missing to/body");

  try {
    const message = await client.messages.create({
      from: twilioWhatsAppFrom,
      to,
      body
    });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("twilio server on 3000"));
