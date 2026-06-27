import { useMemo } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from './ui/Button'
import LandingContent from './LandingContent'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const ASSET_WEBHOOK_URL = import.meta.env.VITE_LANDING_ASSET_WEBHOOK_URL || '#webhook-no-configured'

function shouldShowThankYou() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const purchase = params.get('purchase')
  const status = params.get('status')
  const payment = params.get('payment')
  const mpStatus = params.get('mp_status')
  return purchase === 'success' || status === 'success' || payment === 'success' || mpStatus === 'approved'
}

function buildAssetWebhookUrl(format: 'excel' | 'sheets') {
  if (!ASSET_WEBHOOK_URL || ASSET_WEBHOOK_URL.startsWith('#')) return ASSET_WEBHOOK_URL
  const separator = ASSET_WEBHOOK_URL.includes('?') ? '&' : '?'
  return `${ASSET_WEBHOOK_URL}${separator}format=${format}`
}

function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-3xl bg-card/80 p-8 text-center shadow-2xl ring-1 ring-border">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Pago confirmado</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tu cotizador ya está listo</h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Acá tenés acceso inmediato al archivo Excel y Google Sheets. Descargalo y empezá a usar tu nuevo cotizador.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a href={buildAssetWebhookUrl('excel')} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2 py-3">
                Descargar Excel
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={buildAssetWebhookUrl('sheets')} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2 py-3">
                Obtener Google Sheets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="mt-10 rounded-xl bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              ¿Necesitás ayuda?{' '}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Escribinos por WhatsApp
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

interface LandingRootProps {
  loginUrl?: string
}

export default function LandingRoot({ loginUrl: _loginUrl }: LandingRootProps) {
  const isThankYou = useMemo(() => shouldShowThankYou(), [])

  if (isThankYou) return <ThankYouPage />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingContent />
    </div>
  )
}
