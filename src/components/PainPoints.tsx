import { DollarSign, Package, RefreshCw, FileText, Receipt, Wallet } from 'lucide-react'
import PainPointCard from './PainPointCard'

const pains = [
  {
    icon: DollarSign,
    title: 'Perdés de vista quién te debe',
    description: 'Entre ventas y cuentas corrientes, los pagos pendientes se vuelven difíciles de seguir.',
  },
  {
    icon: Package,
    title: 'El stock no siempre coincide',
    description: 'Lo que decís que tenés no es lo que hay en el depósito.',
  },
  {
    icon: RefreshCw,
    title: 'Los precios cambian y después no hay vuelta atrás',
    description: 'Necesitás manejar listas distintas sin romper cuentas corrientes ni operaciones viejas.',
  },
  {
    icon: FileText,
    title: 'Obras y convenios sin mezclar',
    description: 'Si cada comercio, obra o convenio tiene condiciones distintas, una sola planilla lo mezcla todo.',
  },
  {
    icon: Receipt,
    title: 'Hacer facturas desde la página de ARCA te demora tiempo',
    description: 'Entrar, cargar datos y volver al sistema te corta el ritmo de venta.',
  },
  {
    icon: Package,
    title: 'Los acopios quedan atados a mensajes sueltos',
    description: 'Acopiás por obra o edificio, pero después cuesta remitir con el precio congelado.',
  },
  {
    icon: FileText,
    title: 'Los presupuestos quedan perdidos entre mensajes',
    description: 'Se te pierden los presupuestos en WhatsApp o mail y no les das seguimiento.',
  },
  {
    icon: Wallet,
    title: 'La cuenta corriente la llevás en cuaderno',
    description: 'Saber saldos, vencimientos y deudas es una tarea manual que atrasa.',
  },
]

export default function PainPoints() {
  return (
    <section id="dolores" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lo que ves acá, <span className="text-primary">lo ven tus clientes todos los días</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Facturás a mano, buscás los productos en carpetas y rehacés cada presupuesto desde cero. Ese desorden se nota. Con un solo cambio, lo ordenamos.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-6xl auto-rows-fr items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((pain) => (
            <PainPointCard key={pain.title} pain={pain} />
          ))}
        </div>
      </div>
    </section>
  )
}
