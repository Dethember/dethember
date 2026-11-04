const SITE_ORIGIN = 'https://dethember.github.io';
const EVENTS = ['visit', 'copy', 'share'];

function jsonResponse(body, status, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  };

  if (origin === SITE_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = SITE_ORIGIN;
    headers['Vary'] = 'Origin';
  }

  return new Response(JSON.stringify(body), { status, headers });
}

async function handleRequest(request, env) {
  const origin = request.headers.get('Origin');
  if (origin !== SITE_ORIGIN) {
    return jsonResponse({ error: 'Origin not allowed.' }, 403, null);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': SITE_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      }
    });
  }

  const url = new URL(request.url);

  if (url.pathname === '/api/event' && request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON.' }, 400, origin);
    }

    if (!body || !EVENTS.includes(body.event)) {
      return jsonResponse({ error: 'Unknown event.' }, 400, origin);
    }

    const result = await env.DB.prepare(
      'UPDATE event_counts SET count = count + 1 WHERE event = ?'
    ).bind(body.event).run();

    if (!result.success) {
      return jsonResponse({ error: 'Could not save event.' }, 500, origin);
    }

    return jsonResponse({ ok: true }, 200, origin);
  }

  if (url.pathname === '/api/stats' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT event, count FROM event_counts'
    ).all();

    if (!result.success) {
      return jsonResponse({ error: 'Could not read totals.' }, 500, origin);
    }

    const stats = Object.fromEntries(EVENTS.map((event) => [event, 0]));
    for (const row of result.results) {
      if (EVENTS.includes(row.event)) stats[row.event] = row.count;
    }

    return jsonResponse(stats, 200, origin);
  }

  return jsonResponse({ error: 'Not found.' }, 404, origin);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Analytics request failed:', error);
      return jsonResponse({ error: 'Analytics service error.' }, 500, request.headers.get('Origin'));
    }
  }
};
