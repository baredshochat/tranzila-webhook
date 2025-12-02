import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ---------------------------
// BASE44 WEBHOOK DESTINATION
// ---------------------------
const BASE44_URL =
  "https://brandy-melville-to-israel-e6ff628d.base44.app/api/apps/6890f5d7bddca551e6ff628d/functions/tranzilaNotify";

const BASE44_API_KEY = "62a994200e544bb4ab7844d477353552";

// ---------------------------
// HEALTH CHECK
// ---------------------------
app.get("/", (req, res) => {
  res.send("Tranzila Webhook Running");
});

// ---------------------------
// MAIN WEBHOOK FROM TRANZILA
// ---------------------------
app.post("/", async (req, res) => {
  try {
    const data = req.body;
    console.log("📩 Received from Tranzila:", data);

    // טרנזילה מחזירה Response=000 כאשר התשלום אושר
    const approved = data.Response === "000";

    // Payload שנשלח לבייס44
    const payload = {
      status: approved ? "approved" : "declined",
      amount: data.Amount,
      order_id: data.OrderID,
      confirm_num: data.ConfirmNum,
      card_mask: data.CCNumber,
      customer_name: data.CustomerName,
      email: data.Email,
      phone: data.Phone,
      raw: data
    };

    console.log("➡ Sending to Base44:", payload);

    await fetch(BASE44_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": BASE44_API_KEY
      },
      body: JSON.stringify(payload)
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error in webhook:", err);
    res.status(500).send("ERROR");
  }
});

// ---------------------------
// CLOUD RUN PORT
// ---------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🚀 Server listening on port " + PORT);
});
