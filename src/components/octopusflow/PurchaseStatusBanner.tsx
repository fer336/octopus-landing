import { useEffect, useState } from 'react'

const PURCHASE_STATUS_COPY = {
  success: {
    title: 'Pago recibido',
    message: 'Gracias por comprar OctopusFlow. Si Mercado Pago ya confirmó la operación, te vamos a contactar con el acceso.',
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Tu pago todavía está pendiente de confirmación. Te avisamos apenas Mercado Pago lo apruebe.',
  },
  failure: {
    title: 'No se completó el pago',
    message: 'No pudimos confirmar la compra. Podés intentar nuevamente o escribirnos por WhatsApp.',
  },
} as const

type PurchaseStatus = keyof typeof PURCHASE_STATUS_COPY

export default function PurchaseStatusBanner() {
  const [status, setStatus] = useState<PurchaseStatus | null>(null)

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('purchase')
    if (value === 'success' || value === 'pending' || value === 'failure') {
      setStatus(value as PurchaseStatus)
    }
  }, [])

  if (!status) return null

  const copy = PURCHASE_STATUS_COPY[status]

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 pb-3 pt-[84px] text-primary sm:px-6">
      <div className="mx-auto max-w-6xl rounded-xl border border-primary/20 bg-card/80 px-4 py-3 text-sm shadow-lg shadow-primary/5">
        <p className="font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 text-muted-foreground">{copy.message}</p>
      </div>
    </div>
  )
}
