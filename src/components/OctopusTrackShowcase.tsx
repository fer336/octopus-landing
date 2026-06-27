import { CheckCircle2 } from 'lucide-react'
import TiltCard from './TiltCard'

const features = [
  {
    image: '/assets/ventas-cajas-1200.webp',
    description: 'Centralizá todo tu proceso de ventas en una única pantalla, diseñada para operar rápido, sin errores y sin cambiar de entorno.',
    lines: [
      'Cotizaciones, remitos, facturación y retiros de cuentas corrientes en un solo lugar.',
      'Carga ágil de productos con atajos pensados para mostrador.',
      'Comprobantes profesionales con datos del cliente y detalle completo.',
      'Seguimiento claro entre presupuestos, remitos y facturas.',
    ],
  },
  {
    image: '/assets/catalogo-inventario-1200.webp',
    description: 'Control total de productos, precios y stock sin depender de planillas sueltas.',
    lines: [
      'Carga manual o importación desde Excel.',
      'Actualización masiva de precios por categorías y listas.',
      'Inventario más claro para controlar stock físico y reposición.',
      'Optimización de compras con costos reales.',
    ],
  },
  {
    image: '/assets/lista_de_precios-1200.webp',
    description: 'Listas de precios por cliente para cuentas corrientes, acopios y acuerdos comerciales.',
    lines: [
      'Precios especiales por cliente, obra o convenio.',
      'Márgenes ajustados sin modificar el precio base del producto.',
      'Aplicación automática en ventas, presupuestos y pedidos.',
      'Control de vigencia para mantener listas actualizadas.',
    ],
  },
  {
    image: '/assets/Contacto-categorias-1200.webp',
    description: 'Ordená clientes, proveedores, autorizados y categorías para que cada operación salga más rápido.',
    lines: [
      'Clientes con terceros autorizados para retirar o comprar.',
      'Categorías para organizar el catálogo sin mezclar productos.',
      'Proveedores centralizados para compras y reposición.',
      'Datos comerciales listos para vender mejor.',
    ],
  },
  {
    image: '/assets/reportes-1200.webp',
    description: 'Tomá decisiones con información clara, actualizada y fácil de compartir.',
    lines: [
      'Ventas por período con resúmenes y comparativas.',
      'Productos más vendidos para saber qué mueve el negocio.',
      'Estado de stock y alertas de productos bajos.',
      'Cuentas corrientes con saldos y antigüedad.',
    ],
  },
  {
    image: '/assets/octopustrack-meli-1200.webp',
    description: 'Publicá tus productos en MercadoLibre directo desde OctopusTrack.',
    lines: [
      'Subí tus productos del sistema a MercadoLibre con un solo clic.',
      'Sincronizá stock y precios automáticamente entre ambas plataformas.',
      'Administrá tus publicaciones sin salir de OctopusTrack.',
      'Llegá a miles de compradores sin duplicar trabajo.',
    ],
  },
]

export default function OctopusTrackShowcase() {
  return (
    <section id="caracteristicas" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute left-[-18%] top-[8%] h-[520px] w-[520px] rounded-full bg-primary-300/18 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[18%] right-[-12%] h-[620px] w-[620px] rounded-full bg-primary-700/10 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div id="octopustrack-content" className="reveal-on-scroll scroll-mt-24 text-center">
          <p className="mx-auto mb-5 max-w-2xl text-base font-medium text-primary/80 sm:text-lg">
            Cuando tu comercio crece, necesitás orden real: ventas, stock, clientes, precios y reportes trabajando juntos.
          </p>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-black leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">
            Sistema completo para{' '}
            <span className="text-primary">hacer crecer tu negocio</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Una solución diseñada para comercios que quieren escalar ventas sin perder control operativo.
          </p>
        </div>

        <div className="mt-14 space-y-20 sm:mt-16 sm:space-y-24">
          {features.map((feature, index) => (
            <article
              id={feature.image.includes('reportes') ? 'octopustrack-reportes' : undefined}
              key={feature.image}
              style={{ ['--reveal-delay' as string]: `${index * 90}ms` }}
              className={`reveal-on-scroll mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <TiltCard
                strength={7}
                className="relative overflow-hidden rounded-3xl border border-border bg-card/75 p-1 shadow-2xl shadow-primary-950/10 backdrop-blur-sm dark:shadow-black/35"
              >
                <img
                  src={feature.image}
                  alt="Pantalla de OctopusTrack"
                  className="relative h-auto w-full rounded-2xl"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </TiltCard>

              <div className="flex flex-col justify-center">
                <p className="text-xl font-semibold leading-relaxed text-foreground/85">{feature.description}</p>

                <ul className="mt-6 space-y-3">
                  {feature.lines.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
