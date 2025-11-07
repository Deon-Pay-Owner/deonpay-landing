import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import ClientLandingHeader from '@/components/ClientLandingHeader'
import { CreditCard, Shield, Zap, TrendingUp, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: CreditCard,
      title: 'Pagos Seguros',
      description: 'Procesa pagos con tarjeta de forma segura y confiable con encriptación de nivel bancario.',
    },
    {
      icon: Shield,
      title: 'Protección Total',
      description: 'Cumplimiento PCI-DSS y protección contra fraude para todas tus transacciones.',
    },
    {
      icon: Zap,
      title: 'Procesamiento Rápido',
      description: 'Transacciones en tiempo real con confirmación instantánea.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avanzado',
      description: 'Visualiza tus métricas de negocio con dashboards en tiempo real.',
    },
  ]

  const benefits = [
    'Sin costos de instalación',
    'Integración en minutos',
    'Soporte 24/7',
    'Múltiples métodos de pago',
    'Reportes detallados',
    'API completa y documentada',
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <ClientLandingHeader />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-textPrimary)] mb-6 font-[family-name:var(--font-poppins)]">
              Procesa pagos con
              <span className="text-[var(--color-primary)]"> DeonPay</span>
            </h1>
            <p className="text-xl text-[var(--color-textSecondary)] max-w-3xl mx-auto mb-8">
              La plataforma de pagos más completa para tu negocio. Acepta tarjetas, genera reportes
              y escala sin límites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/signin" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<2s', label: 'Respuesta' },
              { value: '10K+', label: 'Clientes' },
              { value: '24/7', label: 'Soporte' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]"
              >
                <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-textSecondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[var(--color-surface)]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--color-textPrimary)] mb-4 font-[family-name:var(--font-poppins)]">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-[var(--color-textSecondary)]">
              Herramientas profesionales para gestionar tus pagos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <div
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)15' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--color-textSecondary)]">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[var(--color-textPrimary)] mb-6 font-[family-name:var(--font-poppins)]">
                Crece más rápido con DeonPay
              </h2>
              <p className="text-lg text-[var(--color-textSecondary)] mb-8">
                Optimiza tu flujo de pagos y enfócate en hacer crecer tu negocio mientras nosotros
                manejamos la infraestructura de pagos.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                    <span className="text-[var(--color-textPrimary)]">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/signup" className="inline-block w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                    Comenzar Ahora
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-textSecondary)] mb-1">
                        Ingresos del mes
                      </p>
                      <p className="text-3xl font-bold text-[var(--color-textPrimary)]">
                        $124,520
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[var(--color-success)]" />
                  </div>
                  <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[var(--color-primary)] rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-[var(--color-textSecondary)]">Transacciones</p>
                      <p className="text-xl font-semibold text-[var(--color-textPrimary)]">
                        1,234
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-textSecondary)]">Tasa éxito</p>
                      <p className="text-xl font-semibold text-[var(--color-success)]">98.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-textSecondary)]">Clientes</p>
                      <p className="text-xl font-semibold text-[var(--color-textPrimary)]">567</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[var(--color-primary)] text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 font-[family-name:var(--font-poppins)]">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de negocios que confían en DeonPay para sus pagos
          </p>
          <Link href="/signup" className="inline-block w-full sm:w-auto px-4 sm:px-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-white text-[var(--color-primary)] hover:bg-gray-100 border-white"
            >
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-border)]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--color-textPrimary)]">DeonPay</span>
            </div>
            <p className="text-sm text-[var(--color-textSecondary)]">
              © 2025 DeonPay. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
