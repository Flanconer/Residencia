export default function HeroBanner() {
  return (
    <section className="mb-10 grid grid-cols-1 items-center gap-6 rounded-2xl bg-ave-azul px-8 py-10 md:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-ave-oscuro/70">
          Entrega rápida y fácil recolección
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-ave-oscuro md:text-4xl">
          Pollo fresco <br />
          <span className="text-ave-rojo">todos los días</span>
        </h1>
        <p className="mb-6 max-w-sm text-ave-oscuro/80">
          Pollo entero o por pieza y productos congelados elaborados con pechuga de
          pollo, listos para cocinar. Mayoreo y menudeo. Hacemos entregas en todo
          Pachuca.
        </p>
        <a
          href="#productos"
          className="inline-block rounded-full bg-ave-rojo px-6 py-3 font-medium text-white hover:opacity-90"
        >
          Ver catálogo
        </a>
      </div>

      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-ave-paraiso.png"
          alt="AVE Paraíso"
          className="w-48 md:w-64"
        />
      </div>
    </section>
  );
}
