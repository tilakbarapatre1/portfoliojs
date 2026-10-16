// api/track.js
// Vercel Serverless Function to track real visitor IP, network, geolocation and global views

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Extract Real Client IP from Vercel Edge Headers
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : (req.socket && req.socket.remoteAddress) || '127.0.0.1';

    // 2. Extract Real Geolocation provided natively by Vercel Edge
    const country = req.headers['x-vercel-ip-country'] || 'India';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const city = req.headers['x-vercel-ip-city']
      ? decodeURIComponent(req.headers['x-vercel-ip-city'])
      : 'Local';

    // Parse Body
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
    const path = body.path || '/';
    const referrer = body.referrer || req.headers['referer'] || 'Direct Visit';
    const isp = body.network || `${country} Network`;

    // 3. Cloud KV / Upstash Persistence (if user configures Vercel KV)
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    let views = 0;

    if (kvUrl && kvToken) {
      // Increment real views
      const incrRes = await fetch(`${kvUrl}/incr/tb_real_portfolio_views`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const incrData = await incrRes.json();
      views = incrData.result || 1;

      const realVisitor = {
        id: 'real-' + Date.now().toString(36),
        ip: clientIp,
        city,
        region,
        country,
        network: isp,
        device: body.device || 'Desktop',
        os: body.os || 'Unknown OS',
        browser: body.browser || 'Unknown Browser',
        path,
        referrer,
        timestamp: new Date().toISOString(),
        status: 'online'
      };

      // Save real visitor log in Redis list
      await fetch(`${kvUrl}/lpush/tb_real_visitor_logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(realVisitor)
      });
      await fetch(`${kvUrl}/ltrim/tb_real_visitor_logs/0/99`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });

      return res.status(200).json({
        success: true,
        source: 'vercel-kv',
        views,
        visitor: realVisitor
      });
    }

    // 4. Fallback: Global counter service for verified persistent views without DB
    try {
      const badgeRes = await fetch('https://visitor-badge.laobi.icu/badge?page_id=tilakbarapatre.portfolio', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (badgeRes.ok) {
        const svg = await badgeRes.text();
        const matches = svg.match(/<text[^>]*>(\d+)<\/text>\s*<\/g>/);
        if (matches && matches[1]) {
          views = parseInt(matches[1], 10);
        }
      }
    } catch (e) {}

    const realVisitor = {
      id: 'real-' + Date.now().toString(36),
      ip: clientIp,
      city,
      region,
      country,
      network: isp,
      device: body.device || 'Desktop',
      os: body.os || 'Unknown OS',
      browser: body.browser || 'Unknown Browser',
      path,
      referrer,
      timestamp: new Date().toISOString(),
      status: 'online'
    };

    return res.status(200).json({
      success: true,
      source: 'edge',
      views: views || 1,
      visitor: realVisitor
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
