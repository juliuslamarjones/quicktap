export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const ONESIGNAL_REST_KEY = (process.env.ONESIGNAL_REST_KEY || "").trim();

  if (!ONESIGNAL_REST_KEY) {
    return res.status(500).json({ error: "ONESIGNAL_REST_KEY environment variable is missing in Vercel." });
  }

  // Format header specifically for os_v2 keys
  const authHeader = ONESIGNAL_REST_KEY.startsWith("os_v2_")
    ? `Key ${ONESIGNAL_REST_KEY}`
    : `Basic ${ONESIGNAL_REST_KEY}`;

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        headings: { en: title || "Alert" },
        contents: { en: body || "Notification body" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OneSignal API Error",
        status: response.status,
        authHeaderUsed: authHeader.substring(0, 15) + "...",
        oneSignalResponse: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}