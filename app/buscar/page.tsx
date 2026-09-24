import { buscarProductos } from '@/lib/models/productos';
import ProductoCard from '@/components/ProductoCard';

export default async function PaginaBusqueda({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const termino = searchParams.q ?? '';
  const resultados = termino ? await buscarProductos(termino) : [];

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-extrabold text-ave-oscuro">
        Resultados de búsqueda
      </h1>
      <p className="mb-8 text-sm text-ave-oscuro/60">
        {termino
          ? `${resultados.length} ${
              resultados.length === 1 ? 'producto' : 'productos'
            } para "${termino}"`
          : 'Escribe algo en el buscador para empezar.'}
      </p>

      {resultados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {resultados.map((producto: any) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              colorCategoria={producto.categoria?.color_hex}
            />
          ))}
        </div>
      ) : (
        termino && (
          <div className="text-sm text-ave-oscuro/60">
            <p className="mb-2">No encontramos productos con ese nombre.</p>
            <a href="/catalogo" className="text-ave-rojo underline">
              Ver todo el catálogo
            </a>
          </div>
        )
      )}
    </div>
  );
}
