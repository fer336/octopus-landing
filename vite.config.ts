import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'path'

const landingDevRoutes = new Set(['/', '/octopusflow', '/acceder', '/landing', '/landing.html'])

function landingDevFallback() {
  return {
    name: 'landing-dev-fallback',
    apply: 'serve' as const,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
        if (!landingDevRoutes.has(pathname)) {
          next()
          return
        }

        const landingHtmlPath = path.resolve(__dirname, 'landing.html')
        const html = fs.readFileSync(landingHtmlPath, 'utf-8')

        server
          .transformIndexHtml(pathname, html)
          .then((transformedHtml) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(transformedHtml)
          })
          .catch(next)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), landingDevFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        landing: path.resolve(__dirname, 'landing.html'),
        politicasPrivacidad: path.resolve(__dirname, 'politicas-privacidad.html'),
        politicasSeguridad: path.resolve(__dirname, 'politicas-seguridad.html'),
      },
    },
  },
})
