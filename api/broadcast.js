
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY;

  try {
    // Attempt 1: Key header on api.onesignal.com (Standard v2 format)
    let response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        headings: { en: title },
        contents: { en: body }
      })
    });

    let data = await response.json();

    // Attempt 2: Bearer header fallback on api.onesignal.com
    if (!response.ok && data.errors) {
      response = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${ONESIGNAL_REST_KEY}`
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ["Subscribed Users"],
          headings: { en: title },
          contents: { en: body }
        })
      });
      data = await response.json();
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}