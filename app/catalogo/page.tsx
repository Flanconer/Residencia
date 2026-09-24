'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Categoria, ProductoConCategoria } from '@/types';
import ProductoCard from '@/components/ProductoCard';
import { esColorOscuro } from '@/lib/utils/categorias';

export default function PaginaCatalogo() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);

  // Los datos se piden a la API: las funciones de lib/models usan
  // cookies() de next/headers y solo corren en el servidor.
  useEffect(() => {
    const parametro = new URLSearchParams(window.location.search).get('categoria');
    if (parametro) setFiltroActivo(parametro);

    fetch('/api/productos')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setProductos)
      .catch(() => setError('No se pudieron cargar los productos. Recarga la página.'))
      .finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(() => {
    const mapa = new Map<string, Categoria>();
    for (const p of productos) if (p.categoria) mapa.set(p.categoria.slug, p.categoria);
    return Array.from(mapa.values()).sort((a, b) => a.id - b.id);
  }, [productos]);

  const categoriaActiva = categorias.find((c) => c.slug === filtroActivo);

  const productosFiltrados = filtroActivo
    ? productos.filter((p) => p.categoria?.slug === filtroActivo)
    : productos;

  function elegir(slug: string | null) {
    setFiltroActivo(slug);
    // Mantiene la URL al día, para poder compartir el catálogo filtrado
    const url = slug ? `/catalogo?categoria=${slug}` : '/catalogo';
    window.history.replaceState(null, '', url);
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ave-oscuro">
        {categoriaActiva?.nombre ?? 'Catálogo'}
      </h1>
      <p className="mt-2 text-ave-oscuro/60">
        Todos los precios son por unidad de venta. El total final se calcula al pesar tu
        pedido.
      </p>

      <div className="sin-barra -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => elegir(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !filtroActivo
              ? 'bg-ave-oscuro text-white'
              : 'bg-slate-100 text-ave-oscuro hover:bg-slate-200'
          }`}
        >
          Todas
        </button>

        {categorias.map((categoria) => {
          const activa = filtroActivo === categoria.slug;
          const esBlanco = categoria.color_hex.toUpperCase() === '#FFFFFF';

          return (
            <button
              key={categoria.id}
              onClick={() => elegir(categoria.slug)}
              style={activa ? { backgroundColor: categoria.color_hex } : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activa
                  ? `${esColorOscuro(categoria.color_hex) ? 'text-white' : 'text-ave-oscuro'} ${
                      esBlanco ? 'ring-1 ring-inset ring-ave-cielo' : ''
                    }`
                  : 'bg-slate-100 text-ave-oscuro hover:bg-slate-200'
              }`}
            >
              {!activa && (
                <span
                  className={`h-2.5 w-2.5 rounded-full ${esBlanco ? 'ring-1 ring-ave-cielo' : ''}`}
                  style={{ backgroundColor: categoria.color_hex }}
                  aria-hidden
                />
              )}
              {categoria.nombre}
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        {cargando && <p className="text-ave-oscuro/60">Cargando productos...</p>}
        {error && <p className="text-ave-rojo">{error}</p>}

        {!cargando && !error && productosFiltrados.length === 0 && (
          <p className="text-ave-oscuro/60">No hay productos disponibles en esta categoría.</p>
        )}

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
