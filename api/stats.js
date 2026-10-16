// api/stats.js
// Vercel Serverless Function to retrieve real visitor logs & telemetry

const LIVE_SYNC_TOPIC = 'tb_portfolio_live_sessions_v1';
const LIVE_SYNC_URL = `https://ntfy.sh/${LIVE_SYNC_TOPIC}`;

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

    // Fallback: Fetch recent visits from the live sync stream
    let streamLogs = [];
    try {
      const streamRes = await fetch(`${LIVE_SYNC_URL}/json?poll=1&since=24h`);
      if (streamRes.ok) {
        const text = await streamRes.text();
        const lines = text.trim().split('\n');
        const seenIds = new Set();
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message) {
              const msg = JSON.parse(parsed.message);
              if (msg.action === 'visit' && msg.ip && !seenIds.has(msg.id || msg.deviceId)) {
                seenIds.add(msg.id || msg.deviceId);
                streamLogs.unshift(msg);
              }
            }
          } catch (e) {}
        }
      }
    } catch (err) {}

    // Fetch verified global views badge
    let views = streamLogs.length;
    try {
      const badgeRes = await fetch('https://visitor-badge.laobi.icu/badge?page_id=tilakbarapatre.portfolio');
      if (badgeRes.ok) {
        const svg = await badgeRes.text();
        const matches = svg.match(/<text[^>]*>(\d+)<\/text>\s*<\/g>/);
        if (matches && matches[1]) {
          views = parseInt(matches[1], 10);
        }
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      source: 'live-sync',
      views: Math.max(views, streamLogs.length),
      logs: streamLogs.slice(0, 100)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
