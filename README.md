# OctopusTrack Landing

Landing page pública de OctopusTrack.

Este repositorio queda separado del ERP para evitar que cambios de marketing afecten el deploy del sistema principal.

## Desarrollo local

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run check
npm run build
```

El workflow `.github/workflows/ci.yml` ejecuta ambos comandos en cada pull request hacia `main` y en cada push a `main`.

## Releases y deploy

El workflow `.github/workflows/release.yml` se ejecuta al publicar un GitHub Release con un tag exacto `vX.Y.Z`:

1. Valida el tag, instala dependencias y ejecuta los checks y el build de producción.
2. Publica únicamente la imagen inmutable:

   ```txt
   ghcr.io/fer336/octopus-landing:vX.Y.Z
   ```

3. Actualiza `docs/devops/stack.landing.yml` con ese mismo tag y hace un commit `chore(release): pin ...`.
4. Dispara el webhook de Portainer después de que el stack quedó pinneado.
5. Verifica `https://octopustrack.shop/` con reintentos acotados.

No se publica ni se despliega `latest`. El archivo de stack versionado es la fuente de verdad de la imagen activa y permite identificar o revertir una versión exacta.

El stack de Portainer está en:

```txt
docs/devops/stack.landing.yml
```

### Configuración de GitHub

Secret requerido:

- `PORTAINER_LANDING_WEBHOOK_URL`: webhook del stack Git de Portainer.

Variables opcionales de build:

- `VITE_OCTOPUS_TRACK_LOGIN_URL`
- `VITE_OCTOPUS_FLOW_LOGIN_URL`
- `VITE_LANDING_CHECKOUT_URL`
- `VITE_LANDING_MP_CHECKOUT_WEBHOOK_URL`
- `VITE_LANDING_ASSET_WEBHOOK_URL`
- `VITE_VISITOR_WEBHOOK_URL`
