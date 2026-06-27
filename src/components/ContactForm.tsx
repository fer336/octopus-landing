import { useState } from 'react'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import Button from './ui/Button'

const WHATSAPP_URL = 'https://wa.me/5492254596618'
const CONTACT_API = '/api/contacto'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const isValid = /\S+@\S+\.\S+/.test(email.trim()) && message.trim().length > 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || status === 'loading') return
    setStatus('loading')
    try {
      const params = new URLSearchParams(window.location.search)
      const res = await fetch(CONTACT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          source: 'landing-contact-form',
          action: 'contact',
          entry_point: 'contact-form-bottom',
          page_url: window.location.href,
          referrer: document.referrer || undefined,
          user_agent: navigator.userAgent,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          created_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('HTTP error')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-container">
        <div className="mx-auto w-full max-w-xl">
          {status === 'sent' ? (
            <div className="text-center">
              <svg className="mx-auto mb-6 h-14 w-14 text-primary" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                <circle
                  className="checkmark-circle"
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="checkmark-path"
                  d="M14 27l7 7 16-16"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Listo, te contactamos.</h2>
              <p className="mx-auto mt-4 max-w-sm text-base text-muted-foreground">
                Revisá tu correo. Te respondemos con el plan que mejor se adapta a tu negocio.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-12 text-center">
                <h2 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                  ¿Querés saber más? Escribinos.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
                  Dejanos tu correo y contanos qué necesita tu negocio. Te respondemos a la brevedad.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cf-email" className="mb-2 block text-sm font-medium text-muted-foreground">
                    Correo electrónico
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 focus:border-ring focus:bg-card focus:outline-none focus:ring-1 focus:ring-ring/40"
                  />
                </div>

                <div>
                  <label htmlFor="cf-message" className="mb-2 block text-sm font-medium text-muted-foreground">
                    ¿Qué necesita tu negocio?
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={4}
                    placeholder="Ej: tengo una ferretería, cotizo todos los días y quiero manejar el stock y las cuentas corrientes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full resize-none rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 focus:border-ring focus:bg-card focus:outline-none focus:ring-1 focus:ring-ring/40"
                  />
                </div>

                {status === 'error' && (
                  <p key={Date.now()} className="animate-shake text-sm text-destructive">
                    Algo salió mal. Intentá de nuevo o escribinos por{' '}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">
                      WhatsApp
                    </a>
                    .
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full gap-2 ${isValid && status === 'idle' ? 'animate-pulse-subtle' : ''}`}
                  isLoading={status === 'loading'}
                  disabled={!isValid}
                >
                  Enviar consulta
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  O escribinos directo por{' '}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary transition-colors hover:text-primary/80"
                  >
                    WhatsApp
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
