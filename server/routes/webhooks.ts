import express, { Request, Response } from "express";

const router = express.Router();

/**
 * YOCO WEBHOOK ENDPOINT
 * Step 1 only: receive webhook and return 200 quickly
 */
router.post("/yoco", async (req: Request, res: Response) => {
  try {
    console.log("🔔 YOCO WEBHOOK HIT");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ YOCO WEBHOOK ERROR:", err);
    return res.status(500).json({ error: "Webhook error" });
  }
});

export default router;
