import type { Categoria } from '@/types';
import { esColorOscuro, iconoDe } from '@/lib/utils/categorias';

// Cada categoría es una ficha pintada con su color de marca, igual que sus
// empaques. En celular se desliza en fila; en escritorio forma una cuadrícula.
export default function CategoriaIcono({ categorias }: { categorias: Categoria[] }) {
  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-bold text-ave-oscuro">
          ¿Qué se te antoja?
        </h2>
        <a
          href="/catalogo"
          className="shrink-0 text-sm font-semibold text-ave-oscuro/60 transition hover:text-ave-rojo"
        >
          Ver todo el catálogo
        </a>
      </div>

      <div className="sin-barra -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        {categorias.map((categoria) => {
          const Icono = iconoDe(categoria.slug);
          const oscuro = esColorOscuro(categoria.color_hex);
          const esBlanco = categoria.color_hex.toUpperCase() === '#FFFFFF';

          return (
            <a
              key={categoria.id}
              href={`/catalogo?categoria=${categoria.slug}`}
              style={{ backgroundColor: categoria.color_hex }}
              className={`group flex min-w-[11rem] snap-start flex-col justify-between gap-8 rounded-2xl p-5 transition hover:-translate-y-0.5 sm:min-w-0 ${
                oscuro ? 'text-white' : 'text-ave-oscuro'
              } ${esBlanco ? 'ring-1 ring-inset ring-ave-cielo' : ''}`}
            >
              <Icono size={32} strokeWidth={1.5} />
              <span className="font-display text-base font-bold leading-tight sm:text-lg">
                {categoria.nombre}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
