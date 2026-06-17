# Cloudflare Worker Proxy for Landing Forms

This guide documents the pattern used to send OctopusTrack landing form submissions through a Cloudflare Worker before they reach n8n.

The goal is simple: keep webhook secrets out of the browser while still letting a static React/Vite landing page submit forms securely.

## What we built

```txt
Landing page form
→ /api/contacto or /api/demo
→ Cloudflare Worker
→ n8n production webhook
→ Email notification
```

The browser only knows the public proxy routes:

```txt
https://octopustrack.shop/api/contacto
https://octopustrack.shop/api/demo
https://octopustrack.shop/api/octopusflow-checkout
```

The n8n webhook URLs and shared secrets live inside the Cloudflare Worker, not in the frontend bundle.

## Why this matters

Vite exposes every `VITE_*` variable in the built JavaScript bundle. That means values like these are public if used in React:

```txt
VITE_FORM_SECRET=...
VITE_DEMO_SECRET=...
```

Those are not real secrets. Anyone can inspect the browser JavaScript and reuse them.

The Worker fixes that by becoming a tiny server-side layer:

```txt
Browser: public form data only
Worker: adds private n8n secret
n8n: validates secret and sends email
```

## When to use this pattern

Use a Cloudflare Worker proxy when:

- A static site needs to call a private webhook.
- A frontend form should submit to n8n, Zapier, Make, Slack, Discord, or another automation tool.
- You need to hide API keys, webhook secrets, or internal URLs.
- You want validation, rate limiting, CORS control, or spam protection before data reaches the automation workflow.

Do not put real secrets in React, Vite, Next.js client components, or any browser-side JavaScript.

## Cloudflare setup

### 1. Create the Worker

In Cloudflare:

```txt
Workers & Pages → Create → Start with Hello World
```

Worker name used here:

```txt
octopustrack-landing-proxy
```

### 2. Add Worker secrets

In the Worker:

```txt
Settings → Variables and Secrets → Add secret
```

Secrets used:

```txt
N8N_CONTACT_WEBHOOK_URL=https://n8nw.qeva.xyz/webhook/octopus-landing-contacto
N8N_DEMO_WEBHOOK_URL=https://n8nw.qeva.xyz/webhook/octopus-demo-trial
N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL=https://n8nw.qeva.xyz/webhook/octopusflow-mp
N8N_CONTACT_SECRET=ot_form_sk_f6g7h8i9j0
N8N_DEMO_SECRET=ot_demo_sk_a1b2c3d4e5
```

`N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL` is the checkout webhook that creates the Mercado Pago preference for OctopusFlow.

### 3. Add Worker routes

In Cloudflare domain routes:

```txt
Workers Routes → Add route
```

Routes:

```txt
octopustrack.shop/api/contacto*
octopustrack.shop/api/demo*
octopustrack.shop/api/octopusflow-checkout*
```

Both routes point to:

```txt
octopustrack-landing-proxy
```

### 4. Make sure DNS is proxied

Worker Routes only work when the domain traffic passes through Cloudflare.

In DNS records, the root domain must be orange-cloud proxied:

```txt
octopustrack.shop  A  <server-ip>  Proxied
```

If it is gray-cloud `DNS only`, requests go directly to the server and the Worker never runs.

## Worker behavior

The Worker should:

1. Accept only `POST` and `OPTIONS`.
2. Reject invalid JSON.
3. Validate required fields.
4. Add the private `_secret` expected by n8n.
5. Forward the request to the correct production n8n webhook.
6. Return a non-2xx response if n8n fails.

For OctopusFlow checkout, the Worker should post to n8n and redirect the browser to the Mercado Pago URL returned by n8n. The frontend must not send the price. The price/product must be enforced in n8n or in the Worker.

Expected route behavior:

| Request | Expected result |
|---|---|
| `GET /api/demo` | `405 {"error":"Method not allowed"}` |
| `POST /api/demo` with bad email | `400 {"error":"Invalid email"}` |
| `POST /api/contacto` with empty message | `400 {"error":"Invalid message"}` |
| `POST /api/octopusflow-checkout` | Worker posts to n8n and returns `303 Location: <mercado-pago-url>` |
| Valid `POST /api/demo` | n8n receives request and sends admin email |
| Valid `POST /api/contacto` | n8n receives request and sends contact email |

## OctopusFlow checkout Worker code

Route this Worker on:

```txt
octopustrack.shop/api/octopusflow-checkout*
```

Configure this Worker secret:

```txt
N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL
```

Deployable Worker example:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api/octopusflow-checkout')) {
      return new Response('Not found', { status: 404 })
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    if (!env.N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL) {
      return Response.json({ error: 'Checkout webhook is not configured' }, { status: 500 })
    }

    const contentType = request.headers.get('content-type') || ''
    let frontendPayload = {}

    if (contentType.includes('application/json')) {
      frontendPayload = await request.json().catch(() => ({}))
    } else {
      const formData = await request.formData().catch(() => new FormData())
      frontendPayload = Object.fromEntries(formData.entries())
    }

    const n8nResponse = await fetch(env.N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...frontendPayload,
        product: 'octopusflow',
        amount: 70000,
        currency: 'ARS',
        pricing_source: 'worker',
        page_url: request.headers.get('referer') || '',
        created_at: new Date().toISOString(),
      }),
    })

    if (n8nResponse.status >= 400) {
      return Response.json({ error: 'Checkout unavailable' }, { status: 502 })
    }

    const redirectUrl = n8nResponse.headers.get('Location')

    if (!redirectUrl || !String(redirectUrl).startsWith('https://')) {
      return Response.json({ error: 'Invalid checkout redirect' }, { status: 502 })
    }

    return Response.redirect(redirectUrl, 303)
  },
}
```

n8n should create the Mercado Pago preference for OctopusFlow using the server-side price: `$70.000 ARS`. Do not trust or read a price from the frontend payload. The current n8n workflow responds with a redirect, so the Worker captures the n8n `Location` header and returns its own `303` redirect to the browser.

## Frontend changes

The landing posts to relative routes:

```ts
const CONTACT_API = '/api/contacto'
const DEMO_API = '/api/demo'
const OCTOPUSFLOW_CHECKOUT_API = '/api/octopusflow-checkout'
```

The frontend does not send `_secret` anymore.

OctopusFlow checkout uses a plain `POST` form to `/api/octopusflow-checkout`. It may send source/page metadata, but it must not send product price. The checkout price is enforced by n8n/Worker.

Correct payload shape for contact:

```json
{
  "email": "client@example.com",
  "message": "I want more information",
  "source": "landing-contact-form",
  "action": "contact",
  "entry_point": "contact-form-bottom",
  "page_url": "https://octopustrack.shop/",
  "referrer": "",
  "user_agent": "...",
  "utm_source": "...",
  "utm_medium": "...",
  "utm_campaign": "...",
  "created_at": "2026-06-16T00:00:00.000Z"
}
```

Correct payload shape for demo:

```json
{
  "email": "client@example.com",
  "demo_type": "octopustrack",
  "source": "landing",
  "page_url": "https://octopustrack.shop/",
  "referrer": "",
  "user_agent": "...",
  "utm_source": "...",
  "utm_medium": "...",
  "utm_campaign": "...",
  "created_at": "2026-06-16T00:00:00.000Z"
}
```

The frontend must check `response.ok`. If the Worker or n8n fails, the user should see an error instead of a false success message.

## Deployment checklist

- [ ] Worker code is deployed.
- [ ] Worker secrets are configured.
- [ ] Worker routes exist for `/api/contacto*` and `/api/demo*`.
- [ ] Worker route exists for `/api/octopusflow-checkout*`.
- [ ] `N8N_OCTOPUSFLOW_CHECKOUT_WEBHOOK_URL` is configured.
- [ ] n8n/Worker enforces OctopusFlow price as `$70.000 ARS` server-side.
- [ ] Root domain DNS is `Proxied`, not `DNS only`.
- [ ] Landing code posts to relative proxy routes.
- [ ] Landing production image is rebuilt and deployed.
- [ ] `GET /api/demo` returns Worker JSON, not landing HTML.
- [ ] Invalid POST requests return `400` from the Worker.
- [ ] Valid form submissions reach n8n and send email.

## Debugging checklist

### Problem: `/api/demo` returns the landing HTML

The Worker route is not intercepting the request.

Check:

- Is `octopustrack.shop` set to `Proxied` in Cloudflare DNS?
- Does the route pattern include `/api/demo*`?
- Is the route assigned to the correct Worker?

### Problem: Worker direct URL works, but domain route does not

Example direct Worker URL:

```txt
https://octopustrack-landing-proxy.<account>.workers.dev/api/demo
```

If this works but `https://octopustrack.shop/api/demo` does not, the issue is Cloudflare routing or DNS proxy status.

### Problem: form shows error after submit

Check:

- Worker secret names match the code.
- n8n webhook URL is the production URL, not `/webhook-test`.
- n8n workflow is active.
- n8n code node expects the same `_secret` the Worker sends.

### Problem: n8n receives request but sends no email

Check:

- Gmail node credentials are valid.
- n8n code node is not returning `[]` because of a secret mismatch.
- The email node is connected to the code node.
- Recent n8n executions show success or the exact failing node.

## Production verification commands

These commands do not send real emails:

```bash
curl -i https://octopustrack.shop/api/demo
```

Expected:

```txt
HTTP/2 405
server: cloudflare
{"error":"Method not allowed"}
```

```bash
curl -i -X POST https://octopustrack.shop/api/demo \
  -H "Content-Type: application/json" \
  --data '{"email":"bad"}'
```

Expected:

```txt
HTTP/2 400
{"error":"Invalid email"}
```

```bash
curl -i -X POST https://octopustrack.shop/api/contacto \
  -H "Content-Type: application/json" \
  --data '{"email":"test@example.com","message":""}'
```

Expected:

```txt
HTTP/2 400
{"error":"Invalid message"}
```

## Key lesson

Cloudflare Worker is a lightweight backend for static sites.

It is useful whenever the browser needs to trigger something private, but the private credential must not live in the browser.

Think of it as a small secure gate:

```txt
Frontend can knock.
Worker checks the request.
Worker uses the private key.
n8n receives only trusted traffic shape.
```
