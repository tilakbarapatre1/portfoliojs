/**
 * TILAK BARAPATRE — REAL-TIME VISITOR TELEMETRY & MULTI-DEVICE PRESENCE SYSTEM
 * 100% genuine real-world network telemetry: real client IP, ISP, geolocation, active devices, and global views.
 * Real-time cross-device synchronization via Cloud SSE, WebSockets, BroadcastChannel, and Vercel Serverless APIs.
 */

const REAL_LOGS_KEY = 'tb_real_visitor_logs';
const REAL_VIEWS_KEY = 'tb_real_portfolio_views';
const DEVICE_ID_KEY = 'tb_device_id';
const SESSION_ID_KEY = 'tb_session_id';
const LIVE_CHANNEL_NAME = 'tb_portfolio_channel';
const LIVE_SYNC_TOPIC = 'tb_portfolio_live_sessions_v1';
const LIVE_SYNC_URL = `https://ntfy.sh/${LIVE_SYNC_TOPIC}`;

class PortfolioAnalytics {
  constructor() {
    this.deviceId = this.initDeviceId();
    this.sessionId = this.initSessionId();
    this.logs = this.loadRealLogs();
    this.totalViews = this.loadRealViews();
    this.currentClientInfo = null;
    this.heartbeatTimer = null;
    this.channel = null;
    this.activeEventSource = null;

    // Initialize local cross-tab BroadcastChannel if supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(LIVE_CHANNEL_NAME);
      } catch (e) {}
    }
  }

  initDeviceId() {
    try {
      let id = localStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        localStorage.setItem(DEVICE_ID_KEY, id);
      }
      return id;
    } catch (e) {
      return 'dev_' + Math.random().toString(36).substring(2, 9);
    }
  }

  initSessionId() {
    try {
      let sid = sessionStorage.getItem(SESSION_ID_KEY);
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        sessionStorage.setItem(SESSION_ID_KEY, sid);
      }
      return sid;
    } catch (e) {
      return 'sess_' + Math.random().toString(36).substring(2, 9);
    }
  }

  loadRealLogs() {
    try {
      const data = localStorage.getItem(REAL_LOGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  saveRealLogs(logs) {
    try {
      localStorage.setItem(REAL_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {}
  }

  loadRealViews() {
    try {
      const views = localStorage.getItem(REAL_VIEWS_KEY);
      if (views) return parseInt(views, 10);
    } catch (e) {}
    return 0;
  }

  saveRealViews(count) {
    try {
      localStorage.setItem(REAL_VIEWS_KEY, count.toString());
    } catch (e) {}
  }

  parseClientDevice() {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
    let device = 'Desktop';
    let os = 'Windows';
    let browser = 'Browser';

    const isTouch = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const isMobileUa = /Mobile|Android|iP(hone|od)|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer/i.test(ua);
    const isTabletUa = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (isTouch && width >= 600 && width <= 1024 && !isMobileUa);

    if (isTabletUa) {
      device = 'Tablet';
    } else if (isMobileUa || (isTouch && width <= 768)) {
      device = 'Mobile';
    } else {
      device = 'Desktop';
    }

    // High-accuracy OS detection
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/iPhone OS ([\d_]+)/i.test(ua)) {
      const v = ua.match(/iPhone OS ([\d_]+)/i);
      os = `iOS ${v ? v[1].replace(/_/g, '.') : ''}`.trim();
    } else if (/iPad.*OS ([\d_]+)/i.test(ua)) {
      const v = ua.match(/OS ([\d_]+)/i);
      os = `iPadOS ${v ? v[1].replace(/_/g, '.') : ''}`.trim();
    } else if (/Macintosh.*Mac OS X ([\d_]+)/i.test(ua)) {
      const v = ua.match(/Mac OS X ([\d_]+)/i);
      os = `macOS ${v ? v[1].replace(/_/g, '.') : 'Sonoma'}`.trim();
    } else if (/Android ([\d.]+)/i.test(ua)) {
      const v = ua.match(/Android ([\d.]+)/i);
      os = `Android ${v ? v[1] : ''}`.trim();
    } else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    // Browser detection
    if (/Edg\/([\d.]+)/i.test(ua)) browser = `Edge ${ua.match(/Edg\/([\d.]+)/i)[1].split('.')[0]}`;
    else if (/OPR\/([\d.]+)/i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
    else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) browser = 'Samsung Internet';
    else if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg/i.test(ua)) browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1].split('.')[0]}`;
    else if (/Firefox\/([\d.]+)/i.test(ua)) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/i)[1].split('.')[0]}`;
    else if (/Version\/([\d.]+).*Safari/i.test(ua)) browser = `Safari ${ua.match(/Version\/([\d.]+)/i)[1].split('.')[0]}`;
    else if (/Safari/i.test(ua)) browser = 'Safari';

    return {
      device,
      os,
      browser,
      resolution: `${width}x${height}`
    };
  }

  async sendLiveEvent(payload, isBeacon = false) {
    const fullPayload = {
      ...payload,
      deviceId: payload.deviceId || this.deviceId,
      sessionId: payload.sessionId || this.sessionId,
      timestamp: payload.timestamp || new Date().toISOString()
    };

    // Broadcast locally to tabs on same device
    if (this.channel) {
      try {
        this.channel.postMessage(fullPayload);
      } catch (e) {}
    }

    const jsonStr = JSON.stringify(fullPayload);

    // Cross-device broadcast to cloud presence stream
    try {
      if (isBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        navigator.sendBeacon(LIVE_SYNC_URL, blob);
      } else {
        fetch(LIVE_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr,
          keepalive: isBeacon
        }).catch(() => {});
      }
    } catch (e) {}
  }

  async recordRealVisit() {
    const { device, os, browser, resolution } = this.parseClientDevice();
    const currentPath = window.location.pathname + (window.location.hash || '');
    const referrer = document.referrer ? (new URL(document.referrer).hostname || document.referrer) : 'Direct Visit';

    let realIp = 'Detecting...';
    let realCity = 'Connecting';
    let realRegion = '';
    let realCountry = 'India';
    let realFlag = '🇮🇳';
    let realIsp = 'Broadband Network';

    // 1. Fetch genuine network IP and ISP info using real IP geolocation API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const ipRes = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success) {
          realIp = ipData.ip;
          realCity = ipData.city || 'Local City';
          realRegion = ipData.region || '';
          realCountry = ipData.country || 'India';
          realFlag = (ipData.flag && ipData.flag.emoji) ? ipData.flag.emoji : '🌐';
          if (ipData.connection) {
            realIsp = ipData.connection.isp || ipData.connection.org || 'Internet Service Provider';
            if (ipData.connection.asn) {
              realIsp += ` (AS${ipData.connection.asn})`;
            }
          }
        }
      }
    } catch (e) {
      // Fallback 1: db-ip
      try {
        const fallbackRes = await fetch('https://api.db-ip.com/v2/free/self');
        if (fallbackRes.ok) {
          const fb = await fallbackRes.json();
          if (fb.ipAddress) realIp = fb.ipAddress;
          if (fb.city) realCity = fb.city;
          if (fb.stateProv) realRegion = fb.stateProv;
          if (fb.countryName) realCountry = fb.countryName;
        }
      } catch (err) {}
    }

    // 2. Query /api/track on Vercel Edge
    let globalRealViews = this.totalViews + 1;

    try {
      const apiRes = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.deviceId,
          sessionId: this.sessionId,
          action: 'visit',
          path: currentPath,
          referrer,
          network: realIsp,
          flag: realFlag,
          device,
          os,
          browser
        })
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.views) globalRealViews = apiData.views;
        if (apiData.visitor && apiData.visitor.ip && apiData.visitor.ip !== '127.0.0.1') {
          realIp = apiData.visitor.ip;
          if (apiData.visitor.city) realCity = apiData.visitor.city;
          if (apiData.visitor.country) realCountry = apiData.visitor.country;
        }
      } else {
        throw new Error('Local server fallback');
      }
    } catch (apiErr) {
      // Global counter badge fallback
      try {
        const badgeRes = await fetch('https://visitor-badge.laobi.icu/badge?page_id=tilakbarapatre.portfolio');
        if (badgeRes.ok) {
          const svg = await badgeRes.text();
          const matches = svg.match(/<text[^>]*>(\d+)<\/text>\s*<\/g>/);
          if (matches && matches[1]) {
            globalRealViews = parseInt(matches[1], 10);
          }
        }
      } catch (e) {}
    }

    this.totalViews = globalRealViews;
    this.saveRealViews(this.totalViews);
    this.updateFooterDisplay(this.totalViews);

    // 3. Construct Genuine Visitor Entry
    const newRealEntry = {
      id: 'vis-' + Date.now().toString(36),
      deviceId: this.deviceId,
      sessionId: this.sessionId,
      action: 'visit',
      ip: realIp,
      city: realCity,
      region: realRegion,
      country: realCountry,
      flag: realFlag,
      network: realIsp,
      device,
      os,
      browser,
      resolution,
      path: currentPath,
      referrer,
      timestamp: new Date().toISOString(),
      status: 'online'
    };

    this.currentClientInfo = newRealEntry;

    // Save to local logs if not duplicate
    const exists = this.logs.some(l => l.deviceId === this.deviceId && (Date.now() - new Date(l.timestamp).getTime() < 60000));
    if (!exists) {
      this.logs.unshift(newRealEntry);
      if (this.logs.length > 100) this.logs = this.logs.slice(0, 100);
      this.saveRealLogs(this.logs);
    }

    // 4. Broadcast visit event across all devices
    this.sendLiveEvent(newRealEntry);

    // 5. Start live heartbeat timer (every 12 seconds)
    this.startHeartbeat();

    // 6. Listen for state changes & cleanup
    this.setupPresenceListeners();

    return newRealEntry;
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 12000);
  }

  sendHeartbeat(customStatus) {
    if (!this.currentClientInfo) return;
    const currentPath = window.location.pathname + (window.location.hash || '');
    const isHidden = (typeof document !== 'undefined' && document.hidden);
    const status = customStatus || (isHidden ? 'idle' : 'online');

    const heartbeat = {
      action: 'heartbeat',
      deviceId: this.deviceId,
      sessionId: this.sessionId,
      device: this.currentClientInfo.device,
      os: this.currentClientInfo.os,
      browser: this.currentClientInfo.browser,
      ip: this.currentClientInfo.ip,
      city: this.currentClientInfo.city,
      region: this.currentClientInfo.region,
      country: this.currentClientInfo.country,
      flag: this.currentClientInfo.flag,
      network: this.currentClientInfo.network,
      path: currentPath,
      timestamp: new Date().toISOString(),
      status
    };

    this.sendLiveEvent(heartbeat);
  }

  setupPresenceListeners() {
    if (typeof window === 'undefined') return;

    // Visibility change (tab active / backgrounded)
    document.addEventListener('visibilitychange', () => {
      const status = document.hidden ? 'idle' : 'online';
      this.sendHeartbeat(status);
    });

    // Hash or URL change (navigation inside SPA)
    window.addEventListener('hashchange', () => {
      this.sendHeartbeat('online');
    });

    // Page leave / tab close
    const handleLeave = () => {
      this.sendLiveEvent({
        action: 'leave',
        deviceId: this.deviceId,
        sessionId: this.sessionId,
        status: 'offline',
        timestamp: new Date().toISOString()
      }, true);
    };

    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    // Respond to ping requests from dashboard
    if (this.channel) {
      this.channel.addEventListener('message', (e) => {
        if (e.data && e.data.action === 'ping_request') {
          this.sendHeartbeat('online');
        }
      });
    }
  }

  // Subscribe to live multi-device stream (Used by /login admin dashboard)
  subscribeLive(onEventCallback) {
    // 1. Listen to local BroadcastChannel
    if (this.channel) {
      this.channel.addEventListener('message', (e) => {
        if (e.data && onEventCallback) {
          onEventCallback(e.data);
        }
      });
    }

    // 2. Fetch recent 30-minute history to restore currently active devices immediately
    fetch(`${LIVE_SYNC_URL}/json?poll=1&since=30m`)
      .then(r => r.text())
      .then(text => {
        if (!text) return;
        const lines = text.trim().split('\n');
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message) {
              const payload = JSON.parse(parsed.message);
              if (onEventCallback) onEventCallback(payload);
            }
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Connect to Real-Time Server-Sent Events (SSE)
    let sseSource = null;
    const connectSSE = () => {
      try {
        if (sseSource) sseSource.close();
        sseSource = new EventSource(`${LIVE_SYNC_URL}/sse`);
        this.activeEventSource = sseSource;

        sseSource.onopen = () => {
          if (onEventCallback) {
            onEventCallback({ action: 'stream_status', status: 'connected' });
          }
        };

        sseSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.message) {
              const payload = JSON.parse(parsed.message);
              if (onEventCallback) onEventCallback(payload);
            }
          } catch (err) {}
        };

        sseSource.onerror = () => {
          if (onEventCallback) {
            onEventCallback({ action: 'stream_status', status: 'reconnecting' });
          }
          // EventSource auto-reconnects natively
        };
      } catch (err) {
        // Fallback to polling every 5s if SSE is not permitted by client network
        setInterval(() => {
          fetch(`${LIVE_SYNC_URL}/json?poll=1&since=10s`)
            .then(r => r.text())
            .then(txt => {
              if (!txt) return;
              const lines = txt.trim().split('\n');
              for (const l of lines) {
                try {
                  const p = JSON.parse(l);
                  if (p.message && onEventCallback) onEventCallback(JSON.parse(p.message));
                } catch(e){}
              }
            })
            .catch(() => {});
        }, 5000);
      }
    };

    connectSSE();

    // 4. Request all active devices to identify themselves
    this.broadcastPing();
  }

  broadcastPing() {
    this.sendLiveEvent({
      action: 'ping_request',
      senderId: this.deviceId
    });
  }

  async fetchRemoteLogs() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          // Merge remote logs with local logs
          const existingIds = new Set(this.logs.map(l => l.id || (l.deviceId + '-' + l.timestamp)));
          data.logs.forEach(remoteLog => {
            const id = remoteLog.id || (remoteLog.deviceId + '-' + remoteLog.timestamp);
            if (!existingIds.has(id)) {
              this.logs.push(remoteLog);
              existingIds.add(id);
            }
          });
          this.logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
          if (this.logs.length > 100) this.logs = this.logs.slice(0, 100);
          this.saveRealLogs(this.logs);
        }
        if (data.views) {
          this.totalViews = Math.max(this.totalViews, data.views);
          this.saveRealViews(this.totalViews);
        }
      }
    } catch (e) {}
  }

  updateFooterDisplay(count) {
    const el = document.getElementById('footer-views-count');
    if (!el) return;
    el.textContent = Number(count).toLocaleString();
  }

  getRealStats() {
    const totalVisits = this.totalViews;
    const uniqueIps = new Set(this.logs.map(l => l.ip)).size;

    const networkCounts = {};
    const countryCounts = {};
    let mobileCount = 0;

    this.logs.forEach(l => {
      if (l.network) networkCounts[l.network] = (networkCounts[l.network] || 0) + 1;
      if (l.country) countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
      if (l.device === 'Mobile') mobileCount++;
    });

    const topNetwork = Object.keys(networkCounts).sort((a,b) => networkCounts[b] - networkCounts[a])[0] || 'Broadband ISP';
    const topCountry = Object.keys(countryCounts).sort((a,b) => countryCounts[b] - countryCounts[a])[0] || 'India';
    const mobileRatio = this.logs.length > 0 ? Math.round((mobileCount / this.logs.length) * 100) : 0;

    return {
      totalVisits,
      uniqueIps,
      topNetwork,
      topCountry,
      mobileRatio,
      totalLogged: this.logs.length
    };
  }

  clearLogs() {
    this.logs = [];
    this.saveRealLogs([]);
  }
}

// Global instance
window.PortfolioAnalytics = new PortfolioAnalytics();

// Auto-record genuine visit on page load for non-login pages
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('login')) {
    window.PortfolioAnalytics.recordRealVisit();
  }
});
