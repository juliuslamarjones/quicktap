export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const ONESIGNAL_REST_KEY = "os_v2_app_ed76yxkh5rd2fecpnljtiukpiskpkelwydcu7y52pft645v34zcxxlqanai723fdrh627dfjblgp3okgg6oh6onpaovlp2qfg3rvtsy";

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        headings: { en: title },
        contents: { en: body }
      })
    });

    const data = await response.json();

    // If Basic auth fails with OneSignal, retry with Key prefix
    if (!response.ok && data.errors && data.errors.some(e => e.includes('Authorization'))) {
      const retryResponse = await fetch("https://onesignal.com/api/v1/notifications", {
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
      const retryData = await retryResponse.json();
      return res.status(retryResponse.status).json(retryData);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}