import FranjaMarca from '@/components/FranjaMarca';
import { NEGOCIO } from '@/lib/config/negocio';

export default function Footer() {
  return (
    <footer className="no-imprimir mt-8 bg-ave-oscuro text-white">
      <FranjaMarca alto="h-2" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="inline-block rounded-2xl bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ave-paraiso.png" alt={NEGOCIO.nombre} className="h-12 w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Pollo fresco y productos elaborados con pechuga de pollo, con entrega a
            domicilio en {NEGOCIO.zonaEntrega}.
          </p>
        </div>

        <div>
          <h3 className="font-display font-bold">Tienda</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>
              <a href="/catalogo" className="transition hover:text-white">
                Catálogo
              </a>
            </li>
            <li>
              <a href="/#como-funciona" className="transition hover:text-white">
                Cómo funciona
              </a>
            </li>
            <li>
              <a href="/mi-cuenta" className="transition hover:text-white">
                Mi cuenta
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold">Pagos</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>Efectivo al recibir</li>
            <li>Transferencia bancaria</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold">Entregas</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>{NEGOCIO.horarios.entregas}</li>
            <li>Corte a las {NEGOCIO.horarios.corte}</li>
            <li>
              <a href="/aviso-privacidad" className="underline transition hover:text-white">
                Aviso de privacidad
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {NEGOCIO.nombre}. {NEGOCIO.lema}.
      </p>
    </footer>
  );
}
