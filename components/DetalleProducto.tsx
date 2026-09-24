'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductoConCategoria } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { useCarrito } from '@/lib/utils/useCarrito';
import {
  LARGO_MAXIMO_NOTA,
  admiteNotas,
  preparacionesDe,
} from '@/lib/utils/preparaciones';
import { colorVisible, iconoDe, tinte } from '@/lib/utils/categorias';
import { ajustarCantidad, infoUnidad } from '@/lib/utils/unidades';
import NotaPrecioPorPeso from '@/components/NotaPrecioPorPeso';

export default function DetalleProducto({
  producto,
}: {
  producto: ProductoConCategoria;
}) {
  const router = useRouter();
  const { agregarProducto } = useCarrito();

  const opciones = preparacionesDe(producto.categoria?.slug, producto.nombre);
  const unidad = infoUnidad(producto.unidad);

  const conNotas = admiteNotas(producto.categoria?.slug);

  const [cantidad, setCantidad] = useState(unidad.inicial);
  const [nota, setNota] = useState('');
  const [preparacion, setPreparacion] = useState<string | null>(opciones?.[0] ?? null);
  const [agregado, setAgregado] = useState(false);

  const aproximado = producto.precio * cantidad;
  const color = colorVisible(producto.categoria?.color_hex);
  const Icono = iconoDe(producto.categoria?.slug);

  function cambiar(delta: number) {
    setCantidad((c) => ajustarCantidad(c, delta, unidad.minimo));
  }

  function agregar() {
    agregarProducto(producto, cantidad, preparacion, nota);
    setAgregado(true);
    setNota('');
    setTimeout(() => setAgregado(false), 1800);
  }

  function pedirAhora() {
    agregarProducto(producto, cantidad, preparacion, nota);
    router.push('/checkout');
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div
        className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl"
        style={{ backgroundColor: tinte(color, 0.22) }}
      >
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icono size={120} strokeWidth={1} style={{ color }} aria-hidden />
        )}
      </div>

      <div>
        {producto.categoria && (
          <a
            href={`/catalogo?categoria=${producto.categoria.slug}`}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ave-oscuro/60 hover:text-ave-rojo"
          >
            <span
              style={{ backgroundColor: producto.categoria.color_hex }}
              className="h-3 w-3 rounded-full ring-1 ring-slate-300"
              aria-hidden
            />
            {producto.categoria.nombre}
          </a>
        )}

        <h1 className="font-display text-4xl font-extrabold leading-tight text-ave-oscuro">
          {producto.nombre}
        </h1>
        {producto.descripcion && (
          <p className="mt-2 text-ave-oscuro/70">{producto.descripcion}</p>
        )}

        {/* Precio por unidad de venta: lo que cuesta cada kilo o paquete */}
        <p className="mt-5 text-ave-oscuro">
          <span className="font-display text-3xl font-extrabold">
            {formatearMoneda(producto.precio)}
          </span>
          <span className="ml-2 text-lg text-ave-oscuro/60">{unidad.precioPor}</span>
        </p>

        {/* Preparación: solo pollo natural */}
        {opciones && (
          <fieldset className="mt-7">
            <legend className="mb-2.5 font-semibold text-ave-oscuro">
              ¿Cómo lo quieres?
            </legend>
            <div className="flex flex-wrap gap-2">
              {opciones.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setPreparacion(opcion)}
                  aria-pressed={preparacion === opcion}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
                    preparacion === opcion
                      ? 'border-ave-oscuro bg-ave-oscuro text-white'
                      : 'border-slate-200 text-ave-oscuro hover:border-ave-oscuro'
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Cantidad + cálculo visible */}
        <div className="mt-7 rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-ave-oscuro">{unidad.pregunta}</p>

          {unidad.atajos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {unidad.atajos.map((atajo) => (
                <button
                  key={atajo}
                  type="button"
                  onClick={() => setCantidad(atajo)}
                  aria-pressed={cantidad === atajo}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
                    cantidad === atajo
                      ? 'border-ave-oscuro bg-ave-oscuro text-white'
                      : 'border-slate-200 text-ave-oscuro hover:border-ave-oscuro'
                  }`}
                >
                  {unidad.formatear(atajo)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => cambiar(-unidad.paso)}
                disabled={cantidad <= unidad.minimo}
                aria-label="Menos"
                className="h-12 w-12 text-xl text-ave-oscuro/70 transition hover:text-ave-rojo disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-[4.5rem] text-center font-display text-xl font-bold">
                {unidad.formatearCorto(cantidad)}
              </span>
              <button
                type="button"
                onClick={() => cambiar(unidad.paso)}
                aria-label="Más"
                className="h-12 w-12 text-xl text-ave-oscuro/70 transition hover:text-ave-rojo"
              >
                +
              </button>
            </div>
            {unidad.porKilo && (
              <p className="text-xs text-ave-oscuro/50">
                O ajusta por cuartos de kilo.
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm text-ave-oscuro/60">
              {unidad.formatear(cantidad)} × {formatearMoneda(producto.precio)}
            </p>
            <p className="mt-0.5 text-ave-oscuro">
              <span className="text-sm">Aproximadamente </span>
              <span className="font-display text-2xl font-extrabold">
                {formatearMoneda(aproximado)}
              </span>
            </p>
          </div>
        </div>

        {conNotas && (
          <label className="mt-4 block">
            <span className="font-semibold text-ave-oscuro">
              Indicaciones para la planta{' '}
              <span className="font-normal text-ave-oscuro/50">(opcional)</span>
            </span>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value.slice(0, LARGO_MAXIMO_NOTA))}
              rows={2}
              placeholder="Ej.: partida en cuatro, en filetes delgados, que sean 3 mollejas"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-ave-oscuro outline-none transition placeholder:text-ave-oscuro/35 focus:border-ave-oscuro focus:ring-4 focus:ring-ave-cielo/40"
            />
            <span className="mt-1 block text-right text-xs text-ave-oscuro/40">
              {nota.length}/{LARGO_MAXIMO_NOTA}
            </span>
          </label>
        )}

        <div className="mt-4">
          <NotaPrecioPorPeso />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={pedirAhora}
            className="flex-1 rounded-xl bg-ave-rojo px-6 py-3.5 font-semibold text-white transition hover:bg-red-700"
          >
            Pedir ahora
          </button>
          <button
            onClick={agregar}
            className={`flex-1 rounded-xl border-2 px-6 py-3.5 font-semibold transition ${
              agregado
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-ave-rojo text-ave-rojo hover:bg-red-50'
            }`}
          >
            {agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
