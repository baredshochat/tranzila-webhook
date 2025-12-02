import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// כתובת ה-Webhook של Base44/Make
const BASE_WEBHOOK_URL = "https://hooks.make.com/XXXXXXXXXXXXXX"; // נשנה לכתובת שלך

// ברירת מחדל – בדיקת חיים
app.get("/", (req, res) => {
  res.send("Tranzila Webhook Running");
});

// נקודת קבלת ה-NotifyURL מטרנזילה
app.post("/", async (req, res) => {
  try {
    const data = req.body;
    console.log("Received Tranzila POST:", data);

    // תרגום קוד תגובה
    const success = data.Response === "000";

    // יצירת אובייקט נוח להעברה לבייס
    const payload = {
      status: success ? "approved" : "declined",
      response_code: data.Response,
      response_text: data.ResponseText,
      confirm_num: data.ConfirmNum || null,
      amount: data.Amount || null,
      order_id: data.OrderID || null,

      // פרטי לקוח
      customer_name: data.CustomerName || null,
      phone: data.Phone || null,
      email: data.Email || null,

      // כל מה שטרנזילה שלחה
      raw: data
    };

    // שליחה ל-Base/Make
    await fetch(BASE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Forwarded to Base44 successfully");

    // חשוב מאוד: החזרת OK לטרנזילה
    res.status(200).send("OK");

  } catch (err) {
    console.error("Error processing Tranzila webhook:", err);
    res.status(500).send("ERROR");
  }
});

// הפעלת השרת
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server running on port", port);
});
