import { useEffect, useState, type FormEvent } from 'react'
import { X, ArrowRight } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const DEMO_API = '/api/demo'

export interface DemoProduct {
  type: 'octopustrack' | 'octopusflow'
  name: string
}

interface DemoModalProps {
  product: DemoProduct
  open: boolean
  onClose: () => void
}

export default function DemoModal({ product, open, onClose }: DemoModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  /* Reset form state every time the modal opens or the product changes */
  useEffect(() => {
    if (open) {
      setEmail('')
      setLoading(false)
      setSent(false)
      setError(false)
    }
  }, [open, product.type])

  if (!open) return null

  const submitDemo = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(false)

    const search = new URLSearchParams(window.location.search)

    try {
      const res = await fetch(DEMO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          demo_type: product.type,
          source: 'landing',
          page_url: window.location.href,
          referrer: document.referrer || '',
          user_agent: navigator.userAgent,
          utm_source: search.get('utm_source') || '',
          utm_medium: search.get('utm_medium') || '',
          utm_campaign: search.get('utm_campaign') || '',
          created_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('HTTP error')
      setLoading(false)
      setSent(true)
    } catch {
      setLoading(false)
      setError(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {sent ? (
          <>
            <div className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
              Solicitud enviada
            </div>
            <h3 className="mb-1 text-2xl font-bold text-foreground">
              ¡Te vamos a dar acceso pronto!
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Revisá tu correo <strong className="text-foreground">{email}</strong> en los próximos minutos.
              Cuando activemos tu demo, te va a llegar un mail con el link para ingresar a{' '}
              <strong className="text-foreground">{product.name}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg border border-border bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
            >
              Entendido
            </button>
          </>
        ) : (
          <>
            <div className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
              Prueba 7 días
            </div>
            <h3 className="mb-1 text-2xl font-bold text-foreground">
              {product.name}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Dejanos tu correo y te avisamos cuando tengas el demo listo.
            </p>

            <form onSubmit={submitDemo} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">
                  Algo salió mal. Intentá de nuevo o escribinos por{' '}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    WhatsApp
                  </a>.
                </p>
              )}
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:bg-card"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted px-6 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Solicitar demo'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
