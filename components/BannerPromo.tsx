export default function BannerPromo() {
  return (
    <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-2xl bg-ave-oscuro px-6 py-6 text-white">
        <div>
          <p className="mb-1 text-sm text-white/70">Frescura garantizada</p>
          <p className="text-lg font-semibold">Pollo fresco todos los días</p>
        </div>
        <span className="text-4xl" aria-hidden>
          🐔
        </span>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-ave-rojo px-6 py-6 text-white">
        <div>
          <p className="mb-1 text-sm text-white/80">Listo para cocinar</p>
          <p className="text-lg font-semibold">Congelados y empanizados</p>
        </div>
        <span className="text-4xl" aria-hidden>
          🍽️
        </span>
      </div>
    </section>
  );
}
