export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname; // e.g. subdomain.yourdomain.com
    const parts = hostname.split('.');

    // Assuming your domain is two parts: yourdomain.com
    // So subdomain is everything before that, e.g. "subdomain"
    if (parts.length < 3) {
      return new Response('Please use a subdomain.', { status: 400 });
    }

    const subdomain = parts[0];

    if (url.pathname === '/register' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { targetUrl } = data;
        if (!targetUrl) {
          return new Response('targetUrl is required', { status: 400 });
        }

        // Check if subdomain already exists
        const existing = await env.MAPPINGS.get(subdomain);
        if (existing) {
          return new Response('Subdomain already taken', { status: 409 });
        }

        // Save mapping in KV
        await env.MAPPINGS.put(subdomain, targetUrl);

        return new Response(`Subdomain ${subdomain} registered for ${targetUrl}`, { status: 200 });
      } catch (e) {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    // Redirect for subdomain
    const target = await env.MAPPINGS.get(subdomain);
    if (target) {
      return Response.redirect(target, 302);
    }

    return new Response('Subdomain not found', { status: 404 });
  }
};
