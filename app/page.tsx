import { obtenerCategorias, obtenerProductosDestacados } from '@/lib/models/productos';
import ProductoCard from '@/components/ProductoCard';
import CategoriaIcono from '@/components/CategoriaIcono';
import HeroInicio from '@/components/inicio/HeroInicio';
import ComoFunciona from '@/components/inicio/ComoFunciona';
import ZonaEntrega from '@/components/inicio/ZonaEntrega';

// La página principal funciona como landing: presenta el negocio, explica
// cómo funciona (incluido el cobro por peso) y lleva al catálogo.
export default async function PaginaInicio() {
  const [categorias, destacados] = await Promise.all([
    obtenerCategorias(),
    obtenerProductosDestacados(),
  ]);

  return (
    <>
      <HeroInicio />

      <CategoriaIcono categorias={categorias} />

      <ComoFunciona />

      <section className="py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-ave-oscuro">
            Los más pedidos
          </h2>
          <a
            href="/catalogo"
            className="shrink-0 text-sm font-semibold text-ave-oscuro/60 transition hover:text-ave-rojo"
          >
            Ver todo
          </a>
        </div>

        {destacados.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((producto: any) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="text-ave-oscuro/60">
            Marca productos como destacados desde el panel para que aparezcan aquí.{' '}
            <a href="/catalogo" className="font-semibold text-ave-rojo">
              Ver el catálogo
            </a>
          </p>
        )}
      </section>

      <div className="a-sangre border-t border-slate-100" />

      <ZonaEntrega />
    </>
  );
}
