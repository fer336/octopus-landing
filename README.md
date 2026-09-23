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

El deploy sigue una cadena versionada:

1. Un merge a `main` activa `.github/workflows/auto-tag.yml`.
2. Los commits convencionales desde el último tag `vX.Y.Z` determinan el incremento:
   - `feat` → minor.
   - `fix` o `perf` → patch.
   - `!` o `BREAKING CHANGE` → major.
3. Auto Tag publica el GitHub Release y llama al workflow reutilizable `.github/workflows/release.yml`.
4. Release valida y construye el sitio, luego publica únicamente la imagen inmutable:

   ```txt
   ghcr.io/fer336/octopus-landing:vX.Y.Z
   ```

5. El workflow actualiza `docs/devops/stack.landing.yml` con ese mismo tag, hace un commit `chore(release): pin ...` y recién entonces dispara el webhook de Portainer.
6. Después del redeploy verifica `https://octopustrack.shop/` con reintentos acotados.

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
