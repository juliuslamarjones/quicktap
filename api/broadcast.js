import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  const payload = JSON.stringify({
    app_id: "20ffec5d-47ec-47a2-904f-6ad334514f44",
    included_segments: ["Total Subscriptions"],
    headings: { en: title },
    contents: { en: body }
  });

  const options = {
    hostname: 'api.onesignal.com',
    port: 443,
    path: '/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': 'Key os_v2_app_ed76yxkh5rd2fecpnljtiukpiqqzsylxayneel4iyznoc4k4v5bnbaztr2dvhdhmxstr6uhefubu4tzplhzwmq4voayueqt2nji36oi'
    }
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          res.status(response.statusCode).json(parsed);
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse response', raw: data });
        }
        resolve();
      });
    });

    request.on('error', (error) => {
      res.status(500).json({ error: error.message });
      resolve();
    });

    request.write(payload);
    request.end();
  });
}