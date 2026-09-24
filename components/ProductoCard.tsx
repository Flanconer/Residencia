'use client';

import { useState } from 'react';
import type { Categoria, Producto } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { useCarrito } from '@/lib/utils/useCarrito';
import { colorVisible, iconoDe, tinte } from '@/lib/utils/categorias';
import { preparacionesDe } from '@/lib/utils/preparaciones';
import { ajustarCantidad, infoUnidad } from '@/lib/utils/unidades';
import NotaPrecioPorPeso from '@/components/NotaPrecioPorPeso';

interface Props {
  producto: Producto & { categoria?: Categoria | null };
  colorCategoria?: string; // se conserva por compatibilidad
}

export default function ProductoCard({ producto, colorCategoria }: Props) {
  const { agregarProducto } = useCarrito();
  const unidad = infoUnidad(producto.unidad);
  const [cantidad, setCantidad] = useState(unidad.inicial);
  const [agregado, setAgregado] = useState(false);

  const color = colorVisible(producto.categoria?.color_hex ?? colorCategoria);
  const Icono = iconoDe(producto.categoria?.slug);

  // El pollo natural necesita elegir preparación: desde la tarjeta no se
  // puede, así que se manda al detalle. Si se agregara directo, la planta
  // no sabría si va natural, sin piel o deshuesado.
  const requierePreparacion = Boolean(preparacionesDe(producto.categoria?.slug, producto.nombre));

  function manejarAgregar() {
    agregarProducto(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <div className="group flex flex-col">
      <a href={`/producto/${producto.id}`} className="block">
        <div
          className="relative mb-4 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl sm:aspect-[4/3]"
          style={{ backgroundColor: tinte(color, 0.22) }}
        >
          {producto.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            // Sin foto: el ícono de su categoría sobre su color
            <Icono
              size={56}
              strokeWidth={1.25}
              style={{ color }}
              className="opacity-80"
              aria-hidden
            />
          )}

          {producto.categoria && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ave-oscuro backdrop-blur">
              {producto.categoria.nombre}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-ave-oscuro">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="mt-0.5 line-clamp-1 text-sm text-ave-oscuro/55">
            {producto.descripcion}
          </p>
        )}
        <p className="mt-2 text-ave-oscuro">
          <span className="font-bold">{formatearMoneda(producto.precio)}</span>
          <span className="text-sm text-ave-oscuro/55">
            {' '}
            {unidad.precioPor}
          </span>
        </p>
        <div className="mt-1">
          <NotaPrecioPorPeso variante="breve" />
        </div>
      </a>

      <div className="mt-4 flex items-center gap-2">
        {requierePreparacion ? (
          <a
            href={`/producto/${producto.id}`}
            className="flex h-11 flex-1 items-center justify-center rounded-xl border-2 border-ave-oscuro text-sm font-semibold text-ave-oscuro transition hover:bg-ave-oscuro hover:text-white"
          >
            Elegir preparación
          </a>
        ) : (
          <>
            <div className="flex h-11 items-center rounded-xl border border-slate-200">
              <button
                onClick={() => setCantidad((c) => ajustarCantidad(c, -unidad.paso, unidad.minimo))}
                aria-label="Disminuir cantidad"
                className="h-full w-9 text-lg text-ave-oscuro/60 transition hover:text-ave-rojo"
              >
                −
              </button>
              <span className="min-w-[1.5rem] px-1 text-center text-sm font-semibold">
                {unidad.formatearCorto(cantidad)}
              </span>
              <button
                onClick={() => setCantidad((c) => ajustarCantidad(c, unidad.paso, unidad.minimo))}
                aria-label="Aumentar cantidad"
                className="h-full w-9 text-lg text-ave-oscuro/60 transition hover:text-ave-rojo"
              >
                +
              </button>
            </div>

            <button
              onClick={manejarAgregar}
              className={`h-11 flex-1 rounded-xl text-sm font-semibold text-white transition ${
                agregado ? 'bg-emerald-600' : 'bg-ave-rojo hover:bg-red-700'
              }`}
            >
              {agregado ? 'Agregado' : 'Agregar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
