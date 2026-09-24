'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/lib/utils/useCarrito';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import type { Direccion } from '@/types';
import { infoUnidad } from '@/lib/utils/unidades';
import NotaPrecioPorPeso from '@/components/NotaPrecioPorPeso';
import { NEGOCIO } from '@/lib/config/negocio';
import SelectorUbicacion, {
  type UbicacionConfirmada,
} from '@/components/SelectorUbicacion';

export default function PaginaCheckout() {
  const router = useRouter();
  const { items, total, vaciarCarrito } = useCarrito();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [metodoPago, setMetodoPago] = useState<'en_linea' | 'contra_entrega'>(
    'contra_entrega'
  );

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [haySesion, setHaySesion] = useState(false);
  const [ubicacion, setUbicacion] = useState<UbicacionConfirmada | null>(null);
  const [editandoUbicacion, setEditandoUbicacion] = useState(true);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Si el cliente tiene sesión, precargamos sus direcciones guardadas
  useEffect(() => {
    async function cargar() {
      try {
        const r = await fetch('/api/direcciones');
        if (!r.ok) return; // 401: es invitado, se captura la dirección a mano
        const guardadas: Direccion[] = await r.json();
        setHaySesion(true);
        setDirecciones(guardadas);

        const predeterminada = guardadas.find((d) => d.es_predeterminada) ?? guardadas[0];
        if (predeterminada) {
          setUbicacion({
            direccionTexto: predeterminada.direccion_texto,
            codigoPostal: predeterminada.codigo_postal ?? '',
            referencias: predeterminada.referencias ?? '',
            latitud: Number(predeterminada.latitud),
            longitud: Number(predeterminada.longitud),
          });
          setEditandoUbicacion(false);
        }
      } catch {
        // Sin sesión o sin red: se sigue como invitado
      }
    }
    cargar();
  }, []);

  function usarDireccionGuardada(direccion: Direccion) {
    setUbicacion({
      direccionTexto: direccion.direccion_texto,
      codigoPostal: direccion.codigo_postal ?? '',
      referencias: direccion.referencias ?? '',
      latitud: Number(direccion.latitud),
      longitud: Number(direccion.longitud),
    });
    setEditandoUbicacion(false);
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!ubicacion) {
      setError('Confirma la ubicación de entrega antes de continuar.');
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: { nombre, telefono },
          items: items.map((i) => ({
            productoId: i.producto.id,
            cantidad: i.cantidad,
            preparacion: i.preparacion ?? null,
            nota: i.nota ?? null,
          })),
          metodoPago,
          direccionTexto: ubicacion.direccionTexto,
          codigoPostal: ubicacion.codigoPostal,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
          referencias: ubicacion.referencias,
          notas,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? 'No se pudo procesar tu pedido. Intenta de nuevo.');
        setEnviando(false);
        return;
      }

      vaciarCarrito();
      router.push(`/pedido-confirmado/${datos.id}`);
    } catch {
      setError('Hubo un problema al procesar tu pedido. Intenta de nuevo.');
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-ave-oscuro/60">
        Tu carrito está vacío.{' '}
        <a href="/catalogo" className="text-ave-rojo underline">
          Ver el catálogo
        </a>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={manejarSubmit} className="space-y-8">
        <section>
          <h1 className="mb-4 font-display text-3xl font-extrabold text-ave-oscuro">
            Datos de entrega
          </h1>

          {!haySesion && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-ave-oscuro/70">
              Estás comprando como invitado.{' '}
              <a href="/login" className="text-ave-rojo underline">
                Inicia sesión
              </a>{' '}
              para guardar tus direcciones y ver tu historial.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ave-oscuro">
                Nombre completo
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ave-oscuro">
                Teléfono
              </label>
              <input
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                inputMode="tel"
                placeholder="771 123 4567"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-ave-oscuro">
            ¿Dónde te lo entregamos?
          </h2>

          {direcciones.length > 0 && (
            <div className="mb-4 space-y-2">
              {direcciones.map((direccion) => {
                const seleccionada =
                  !editandoUbicacion &&
                  ubicacion?.direccionTexto === direccion.direccion_texto;

                return (
                  <button
                    key={direccion.id}
                    type="button"
                    onClick={() => usarDireccionGuardada(direccion)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      seleccionada
                        ? 'border-ave-rojo bg-red-50'
                        : 'border-slate-200 hover:border-ave-oscuro'
                    }`}
                  >
                    <span className="font-medium text-ave-oscuro">
                      {direccion.etiqueta ?? 'Dirección'}
                    </span>
                    <span className="block text-ave-oscuro/60">
                      {direccion.direccion_texto}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {editandoUbicacion ? (
            <SelectorUbicacion
              valorInicial={ubicacion ?? undefined}
              onConfirmar={(u) => {
                setUbicacion(u);
                setEditandoUbicacion(false);
                setError('');
              }}
              onCancelar={
                direcciones.length > 0 ? () => setEditandoUbicacion(false) : undefined
              }
            />
          ) : (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
              <div className="text-sm">
                <p className="font-medium text-ave-oscuro">{ubicacion?.direccionTexto}</p>
                {ubicacion?.codigoPostal && (
                  <p className="text-ave-oscuro/60">CP {ubicacion.codigoPostal}</p>
                )}
                {ubicacion?.referencias && (
                  <p className="text-xs text-ave-oscuro/50">{ubicacion.referencias}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditandoUbicacion(true)}
                className="shrink-0 text-sm text-ave-rojo underline"
              >
                Cambiar
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-ave-oscuro">
            Método de pago
          </h2>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <input
                type="radio"
                checked={metodoPago === 'contra_entrega'}
                onChange={() => setMetodoPago('contra_entrega')}
              />
              <span>
                <span className="font-medium text-ave-oscuro">Pago al recibir</span>
                <span className="block text-ave-oscuro/60">
                  Efectivo o transferencia al repartidor
                </span>
              </span>
            </label>

            <p className="text-xs text-ave-oscuro/50">
              Como el precio depende del peso final, el cobro se hace al momento de
              la entrega.
            </p>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-ave-oscuro">
              Indicaciones para la entrega (opcional)
            </label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Tocar el timbre, dejar con el portero, llamar al llegar"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
            />
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-ave-rojo">{error}</p>
        )}

        {NEGOCIO.pedidoMinimo > 0 && total < NEGOCIO.pedidoMinimo && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            El pedido mínimo para entrega a domicilio es de{' '}
            {formatearMoneda(NEGOCIO.pedidoMinimo)}. Te faltan{' '}
            {formatearMoneda(NEGOCIO.pedidoMinimo - total)}.{' '}
            <a href="/catalogo" className="font-semibold underline">
              Agregar productos
            </a>
          </p>
        )}

        <button
          disabled={
            enviando ||
            !ubicacion ||
            (NEGOCIO.pedidoMinimo > 0 && total < NEGOCIO.pedidoMinimo)
          }
          className="w-full rounded-xl bg-ave-rojo px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {enviando ? 'Enviando pedido...' : 'Hacer pedido'}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
        <h2 className="mb-1 font-bold tracking-tight text-ave-oscuro">
          Resumen del pedido
        </h2>

        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div
              key={`${item.producto.id}-${item.preparacion ?? ''}-${item.nota ?? ''}`}
              className="flex justify-between gap-3"
            >
              <span className="text-ave-oscuro/80">
                {item.producto.nombre}
                {item.preparacion && (
                  <span className="text-ave-oscuro/50"> · {item.preparacion}</span>
                )}
                <span className="block text-xs text-ave-oscuro/50">
                  {infoUnidad(item.producto.unidad).formatear(item.cantidad)}
                </span>
                {item.nota && (
                  <span className="block text-xs italic text-ave-oscuro/60">
                    &ldquo;{item.nota}&rdquo;
                  </span>
                )}
              </span>
              <span className="shrink-0 text-ave-oscuro">
                {formatearMoneda(item.producto.precio * item.cantidad)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-ave-oscuro/60">Total aproximado</span>
          <span className="font-display text-2xl font-extrabold text-ave-oscuro">
            {formatearMoneda(total)}
          </span>
        </div>

        <div className="mt-4">
          <NotaPrecioPorPeso />
        </div>
      </aside>
    </div>
  );
}
