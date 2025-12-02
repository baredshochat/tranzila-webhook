import express from "express";
import bodyParser from "body-parser";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/tranzila", async (req, res) => {
  try {
    const data = req.body;

    await db.collection("TRANSACTIONS")
      .doc(data.transaction_id || Date.now().toString())
      .set({
        status: data.status,
        amount: data.sum,
        order_id: data.order_id,
        raw: data,
        createdAt: new Date()
      });

    console.log("Transaction saved:", data);

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("ERROR");
  }
});

app.get("/", (req, res) => {
  res.send("Tranzila webhook running");
});

export default app;
