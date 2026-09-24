import FranjaMarca from '@/components/FranjaMarca';
import { NEGOCIO } from '@/lib/config/negocio';

// El hero usa el azul de los volantes de la marca como superficie, y el
// "plato": un círculo blanco rodeado por los colores de las categorías.
export default function HeroInicio() {
  return (
    <section className="a-sangre -mt-8 bg-ave-cielo">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div className="entrada-hero">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ave-oscuro sm:text-5xl lg:text-6xl">
            Pollo fresco de Pachuca, pesado y entregado en tu casa.
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-ave-oscuro/80">
            Pollo entero, en pieza y productos listos para cocinar, preparados como
            los pides. Mayoreo y menudeo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/catalogo"
              className="rounded-xl bg-ave-rojo px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-900/10 transition hover:bg-red-700"
            >
              Hacer mi pedido
            </a>
            <a
              href="#como-funciona"
              className="rounded-xl bg-white/70 px-6 py-3.5 font-semibold text-ave-oscuro transition hover:bg-white"
            >
              Cómo funciona
            </a>
          </div>
        </div>

        <div className="entrada-hero flex justify-center [animation-delay:150ms]">
          <div
            className="relative aspect-square w-full max-w-[14rem] rounded-full p-2.5 sm:max-w-[22rem] sm:p-3"
            style={{
              background:
                'conic-gradient(#FFFFFF 0 12.5%, #5FC9B5 0 25%, #2E8B6F 0 37.5%, #F4C430 0 50%, #F4934A 0 62.5%, #7B4FA6 0 75%, #F7B98C 0 87.5%, #C1272D 0 100%)',
            }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
              {NEGOCIO.imagenHero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={NEGOCIO.imagenHero}
                  alt="Pollo fresco AVE Paraíso"
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/logo-ave-paraiso.png"
                  alt={NEGOCIO.nombre}
                  className="w-3/4"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FranjaMarca alto="h-3" />
    </section>
  );
}
