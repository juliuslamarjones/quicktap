export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, message, url, adminPin } = req.body;

  if (adminPin !== '1234') { 
    return res.status(401).json({ error: 'Invalid Passcode' });
  }

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const ONESIGNAL_APP_ID = "20ffec5d-47ec-47a2-904f-6ad334514f44"; 
  let ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!ONESIGNAL_API_KEY) {
    return res.status(500).json({ error: 'ONESIGNAL_REST_API_KEY is not set on Vercel.' });
  }

  ONESIGNAL_API_KEY = ONESIGNAL_API_KEY.trim().replace(/^["']|["']$/g, '');

  const authHeader = ONESIGNAL_API_KEY.startsWith('os_v2_') 
    ? `Key ${ONESIGNAL_API_KEY}` 
    : `Basic ${ONESIGNAL_API_KEY}`;

  try {
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      // TARGET ACTIVE USERS (Matches your 2 live subscribers)
      included_segments: ["Active Users", "Total Subscriptions"],
      headings: { en: title },
      contents: { en: message },
      url: url || 'https://www.quicktapsolutions.com'
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.errors) {
      const errDetail = Array.isArray(data.errors) ? data.errors.join(', ') : JSON.stringify(data.errors);
      return res.status(400).json({ error: `OneSignal Error: ${errDetail}` });
    }

    return res.status(200).json({ success: true, result: data });

  } catch (error) {
    return res.status(500).json({ error: `Server Error: ${error.message}` });
  }
}