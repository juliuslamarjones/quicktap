export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const ONESIGNAL_REST_KEY = (process.env.ONESIGNAL_REST_KEY || "").trim();

  if (!ONESIGNAL_REST_KEY) {
    return res.status(500).json({ error: "ONESIGNAL_REST_KEY is missing in environment variables." });
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["Subscribed Users"],
    headings: { en: title },
    contents: { en: body }
  };

  // Try standard authorization header formats for OneSignal v2 keys
  const authFormats = [
    `Key ${ONESIGNAL_REST_KEY}`,
    `Bearer ${ONESIGNAL_REST_KEY}`,
    `Basic ${ONESIGNAL_REST_KEY}`
  ];

  let lastError = null;

  for (const authHeader of authFormats) {
    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": authHeader
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && !data.errors) {
        return res.status(200).json(data);
      }

      lastError = data;
    } catch (err) {
      lastError = { error: err.message };
    }
  }

  return res.status(400).json({
    error: "All authorization attempts failed",
    details: lastError
  });
}