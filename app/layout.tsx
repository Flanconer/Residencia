import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/print.css';
import BarraUbicacion from '@/components/BarraUbicacion';
import BotonWhatsApp from '@/components/BotonWhatsApp';
import Footer from '@/components/Footer';
import BarraBusqueda from '@/components/BarraBusqueda';
import MenuCuenta from '@/components/MenuCuenta';
import ContadorCarrito from '@/components/ContadorCarrito';
import { NEGOCIO } from '@/lib/config/negocio';

export const metadata: Metadata = {
  title: `${NEGOCIO.nombre} · ${NEGOCIO.lema}`,
  description:
    'Pollo entero, por pieza y productos elaborados con pechuga de pollo, con entrega a domicilio en Pachuca.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#9DD3EE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Tipografías: Bricolage Grotesque para títulos, Figtree para texto */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div className="no-imprimir bg-ave-oscuro px-4 py-2 text-white sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <BarraUbicacion />
            <span className="hidden text-xs text-white/60 sm:block">
              Entregas {NEGOCIO.horarios.entregas.toLowerCase()} en {NEGOCIO.zonaEntrega}
            </span>
          </div>
        </div>

        <header className="no-imprimir sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <a href="/" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-ave-paraiso.png" alt={NEGOCIO.nombre} className="h-11 w-auto" />
            </a>

            <div className="hidden max-w-md flex-1 md:block">
              <BarraBusqueda />
            </div>

            <nav className="flex items-center gap-1 text-sm font-semibold text-ave-oscuro sm:gap-2">
              <a
                href="/catalogo"
                className="rounded-lg px-2 py-1.5 transition hover:bg-ave-cielo-claro"
              >
                Catálogo
              </a>
              <MenuCuenta />
              <ContadorCarrito />
            </nav>
          </div>

          {/* En celular el buscador baja a su propia fila */}
          <div className="px-4 pb-3 md:hidden">
            <BarraBusqueda />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

        <Footer />

        <BotonWhatsApp />
      </body>
    </html>
  );
}
