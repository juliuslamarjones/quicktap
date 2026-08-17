export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const rawKey = (process.env.ONESIGNAL_REST_KEY || process.env.ONESIGNAL_REST_API_KEY || "").trim();

  if (!rawKey) {
    return res.status(500).json({ error: "OneSignal REST API key is missing in Vercel environment variables." });
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["Total Subscriptions"], // Use the exact default OneSignal segment
    headings: { en: title || "Community Alert" },
    contents: { en: body || "New notification from management." }
  };

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${rawKey}` // Standard OneSignal Basic auth format
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OneSignal API Error",
        status: response.status,
        oneSignalResponse: data
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}