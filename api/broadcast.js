export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const appId = "20ffec5d-47ec-47a2-904f-6ad334514f44";
  const restApiKey = "YOUR_ONESIGNAL_REST_API_KEY"; // Insert your key here

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${restApiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Subscribed Users"],
        headings: { en: title },
        contents: { en: body },
        url: "https://quicktapsolutions.com/knightsbridge.html"
      })
    });

    const data = await response.json();

    if (data.id) {
      return res.status(200).json({ success: true, id: data.id });
    } else {
      return res.status(400).json({ success: false, error: data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}