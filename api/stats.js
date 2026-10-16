// api/stats.js
// Vercel Serverless Function to retrieve real visitor logs & telemetry

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const viewsRes = await fetch(`${kvUrl}/get/tb_real_portfolio_views`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const viewsData = await viewsRes.json();
      const views = viewsData.result ? parseInt(viewsData.result, 10) : 0;

      const logsRes = await fetch(`${kvUrl}/lrange/tb_real_visitor_logs/0/99`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const logsData = await logsRes.json();
      let logs = [];
      if (Array.isArray(logsData.result)) {
        logs = logsData.result.map(item => {
          try {
            return typeof item === 'string' ? JSON.parse(item) : item;
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      }

      return res.status(200).json({
        success: true,
        source: 'vercel-kv',
        views,
        logs
      });
    }

    // Default response if cloud DB not yet linked
    return res.status(200).json({
      success: true,
      source: 'client-sync',
      message: 'Active. Logs synchronized via client telemetry.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
