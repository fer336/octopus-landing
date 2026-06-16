# OctopusTrack Landing

Landing page pública de OctopusTrack.

Este repositorio queda separado del ERP para evitar que cambios de marketing afecten el deploy del sistema principal.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

El workflow `.github/workflows/landing-deploy.yml` publica la imagen:

```txt
ghcr.io/fer336/octopus-landing:<version>
ghcr.io/fer336/octopus-landing:latest
```

Usar tags numéricos:

```bash
git tag 1.0.0
git push origin 1.0.0
```

El stack de Portainer está en:

```txt
docs/devops/stack.landing.yml
```

Variables esperadas en GitHub Actions:

- `PORTAINER_LANDING_WEBHOOK_URL` como secret.
- `VITE_OCTOPUS_TRACK_LOGIN_URL` como variable opcional.
- `VITE_OCTOPUS_FLOW_LOGIN_URL` como variable opcional.
- `VITE_LANDING_CHECKOUT_URL` como variable opcional.
- `VITE_LANDING_MP_CHECKOUT_WEBHOOK_URL` como variable opcional.
- `VITE_LANDING_ASSET_WEBHOOK_URL` como variable opcional.
- `VITE_VISITOR_WEBHOOK_URL` como variable opcional.

## Cloudflare Worker Proxy

Las rutas `/api/contacto` y `/api/demo` son servidas por el Worker `octopustrack-landing-proxy`,
que redirige las solicitudes a n8n agregando los secrets internamente.

**No se necesitan `VITE_FORM_SECRET` ni `VITE_DEMO_SECRET`** en el build de Vite.
Los secrets de n8n viven exclusivamente en el Worker de Cloudflare, no en GitHub Actions ni en el frontend.
