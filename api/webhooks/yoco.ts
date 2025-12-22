export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    console.log("🔔 YOCO WEBHOOK HIT (VERCEL)");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ YOCO WEBHOOK ERROR (VERCEL):", err);
    return res.status(500).json({ error: "Webhook error" });
  }
}
