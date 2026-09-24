'use client';

import { useCarrito } from '@/lib/utils/useCarrito';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { claveItem } from '@/lib/utils/preparaciones';
import { infoUnidad } from '@/lib/utils/unidades';
import NotaPrecioPorPeso from '@/components/NotaPrecioPorPeso';
import { NEGOCIO } from '@/lib/config/negocio';

export default function PaginaCarrito() {
  const { items, quitarItem, cambiarCantidad, total } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ave-oscuro">
          Tu carrito está vacío
        </h1>
        <a
          href="/catalogo"
          className="mt-6 inline-block rounded-xl bg-ave-rojo px-6 py-3.5 font-semibold text-white transition hover:bg-red-700"
        >
          Ver el catálogo
        </a>
      </div>
    );
  }

  const faltaParaMinimo =
    NEGOCIO.pedidoMinimo > 0 ? Math.max(0, NEGOCIO.pedidoMinimo - total) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="mb-6 font-display text-3xl font-extrabold text-ave-oscuro">Tu carrito</h1>

        <div className="space-y-3">
          {items.map((item) => {
            const clave = claveItem(item.producto.id, item.preparacion, item.nota);
            const unidad = infoUnidad(item.producto.unidad);

            const cambiar = (delta: number) => {
              const nueva = Math.round((item.cantidad + delta) * 100) / 100;
              // Por debajo del mínimo, el producto se quita del carrito
              cambiarCantidad(clave, nueva < unidad.minimo ? 0 : nueva);
            };

            return (
              <div
                key={clave}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-5"
              >
                <div className="min-w-[12rem] flex-1">
                  <p className="font-display text-lg font-bold text-ave-oscuro">
                    {item.producto.nombre}
                  </p>
                  {item.preparacion && (
                    <span className="mt-1 inline-block rounded-lg bg-ave-oscuro px-2.5 py-0.5 text-xs font-semibold text-white">
                      {item.preparacion}
                    </span>
                  )}
                  {item.nota && (
                    <p className="mt-1.5 text-sm italic text-ave-oscuro/70">
                      &ldquo;{item.nota}&rdquo;
                    </p>
                  )}
                  {/* El cálculo, a la vista: cantidad × precio por unidad */}
                  <p className="mt-2 text-sm text-ave-oscuro/60">
                    {unidad.formatear(item.cantidad)} × {formatearMoneda(item.producto.precio)}{' '}
                    {unidad.porKilo ? 'por kg' : 'c/u'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button
                      onClick={() => cambiar(-unidad.paso)}
                      aria-label="Menos"
                      className="h-10 w-10 text-lg text-ave-oscuro/70 transition hover:text-ave-rojo"
                    >
                      −
                    </button>
                    <span className="min-w-[3.5rem] text-center text-sm font-semibold">
                      {unidad.formatearCorto(item.cantidad)}
                    </span>
                    <button
                      onClick={() => cambiar(unidad.paso)}
                      aria-label="Más"
                      className="h-10 w-10 text-lg text-ave-oscuro/70 transition hover:text-ave-rojo"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <p className="text-xs text-ave-oscuro/50">aprox.</p>
                    <p className="font-bold text-ave-oscuro">
                      {formatearMoneda(item.producto.precio * item.cantidad)}
                    </p>
                  </div>

                  <button
                    onClick={() => quitarItem(clave)}
                    className="text-sm text-ave-oscuro/50 transition hover:text-ave-rojo"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-28">
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-ave-oscuro/60">Total aproximado</p>
          <p className="font-display text-3xl font-extrabold text-ave-oscuro">
            {formatearMoneda(total)}
          </p>
          {faltaParaMinimo > 0 ? (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-ave-rojo"
                  style={{ width: `${Math.min(100, (total / NEGOCIO.pedidoMinimo) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-ave-oscuro/70">
                Te faltan <strong>{formatearMoneda(faltaParaMinimo)}</strong> para el pedido
                mínimo de entrega ({formatearMoneda(NEGOCIO.pedidoMinimo)}).
              </p>
              <a
                href="/catalogo"
                className="mt-4 block rounded-xl border-2 border-ave-rojo px-6 py-3 text-center font-semibold text-ave-rojo transition hover:bg-red-50"
              >
                Agregar más productos
              </a>
            </div>
          ) : (
            <a
              href="/checkout"
              className="mt-5 block rounded-xl bg-ave-rojo px-6 py-3.5 text-center font-semibold text-white transition hover:bg-red-700"
            >
              Continuar con mi pedido
            </a>
          )}
        </div>
        <NotaPrecioPorPeso />
      </aside>
    </div>
  );
}
