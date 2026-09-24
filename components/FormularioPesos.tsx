'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PedidoConDetalle } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { infoUnidad } from '@/lib/utils/unidades';
import { NEGOCIO, hayDatosTransferencia } from '@/lib/config/negocio';

export default function FormularioPesos({ pedido }: { pedido: PedidoConDetalle }) {
  const router = useRouter();

  // Arranca con el peso pedido como sugerencia; la secretaria lo corrige
  // con lo que la planta anotó en la hoja impresa.
  const [pesos, setPesos] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      pedido.items.map((item) => [
        item.id,
        String(item.cantidad_real ?? item.cantidad),
      ])
    )
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [totalGuardado, setTotalGuardado] = useState<number | null>(
    pedido.total_final
  );

  // Total calculado en vivo mientras se capturan los pesos
  const totalEnVivo = pedido.items.reduce((suma, item) => {
    const peso = Number(pesos[item.id]);
    if (!Number.isFinite(peso) || peso <= 0) return suma;
    return suma + Number(item.precio_unitario) * peso;
  }, 0);

  const diferencia = totalEnVivo - Number(pedido.total_estimado);

  async function guardar() {
    setError('');

    const capturados = pedido.items.map((item) => ({
      itemId: item.id,
      cantidadReal: Number(pesos[item.id]),
    }));

    if (capturados.some((p) => !Number.isFinite(p.cantidadReal) || p.cantidadReal <= 0)) {
      setError('Revisa los pesos: todos deben ser mayores a cero.');
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(`/api/pedidos/${pedido.id}/pesos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesos: capturados }),
      });

      if (!respuesta.ok) throw new Error();

      const datos = await respuesta.json();
      setTotalGuardado(datos.totalFinal);
      router.refresh();
    } catch {
      setError('No se pudieron guardar los pesos. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  // Mensaje de WhatsApp con el total ya cerrado
  function enlaceWhatsApp() {
    const telefono = (pedido.usuario?.telefono ?? '').replace(/\D/g, '');
    const numero = telefono.length === 10 ? `52${telefono}` : telefono;

    const lineas = [
      `Hola ${pedido.usuario?.nombre ?? ''}, tu pedido #${pedido.id} de AVE Paraíso ya está listo.`,
      '',
      ...pedido.items.map((item) => {
        const peso = pesos[item.id];
        const prep = item.preparacion ? ` (${item.preparacion})` : '';
        return `• ${item.producto.nombre}${prep}: ${peso} ${item.producto.unidad}`;
      }),
      '',
      `*Total: ${formatearMoneda(totalGuardado ?? totalEnVivo)}*`,
      '',
      'Puedes pagar en efectivo al recibir o por transferencia:',
      ...(hayDatosTransferencia()
        ? [
            `Banco: ${NEGOCIO.transferencia.banco}`,
            `Titular: ${NEGOCIO.transferencia.titular}`,
            `CLABE: ${NEGOCIO.transferencia.clabe}`,
          ]
        : []),
      '',
      'Va en camino. ¡Gracias por tu compra!',
    ].join('\n');

    return `https://wa.me/${numero}?text=${encodeURIComponent(lineas)}`;
  }

  async function marcarAvisado() {
    await fetch(`/api/pedidos/${pedido.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marcarNotificado: true, estado: 'en_reparto' }),
    });
    router.refresh();
  }

  return (
    <div className="no-imprimir rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-1 font-bold tracking-tight text-ave-oscuro">
        Captura de pesos
      </h2>
      <p className="mb-4 text-sm text-ave-oscuro/60">
        Anota aquí los pesos que la planta marcó en la hoja impresa.
      </p>

      <div className="space-y-3">
        {pedido.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
          >
            <div className="text-sm">
              <p className="font-medium text-ave-oscuro">{item.producto.nombre}</p>
              {item.preparacion && (
                <span className="text-xs text-ave-oscuro/60">{item.preparacion}</span>
              )}
              {item.nota && (
                <p className="text-xs font-semibold italic text-ave-oscuro/80">
                  &ldquo;{item.nota}&rdquo;
                </p>
              )}
              <p className="text-xs text-ave-oscuro/50">
                Pidió: {infoUnidad(item.producto.unidad).formatear(Number(item.cantidad))} ·{' '}
                {formatearMoneda(Number(item.precio_unitario))}{' '}
                {infoUnidad(item.producto.unidad).porKilo ? 'por kg' : 'c/u'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={pesos[item.id] ?? ''}
                onChange={(e) =>
                  setPesos((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-right text-sm outline-none focus:border-ave-rojo"
              />
              <span className="w-14 text-xs text-ave-oscuro/50">
                {item.producto.unidad}
              </span>
              <span className="w-24 text-right text-sm font-medium text-ave-oscuro">
                {formatearMoneda(
                  Number(item.precio_unitario) * (Number(pesos[item.id]) || 0)
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between text-ave-oscuro/60">
          <span>Estimado al pedir</span>
          <span>{formatearMoneda(Number(pedido.total_estimado))}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-ave-oscuro">
          <span>Total a cobrar</span>
          <span className="text-ave-rojo">{formatearMoneda(totalEnVivo)}</span>
        </div>
        {Math.abs(diferencia) > 0.5 && (
          <p className="text-xs text-ave-oscuro/50">
            {diferencia > 0 ? 'Subió' : 'Bajó'} {formatearMoneda(Math.abs(diferencia))}{' '}
            respecto al estimado.
          </p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-ave-rojo">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-lg bg-ave-rojo px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {guardando
            ? 'Guardando...'
            : totalGuardado != null
              ? 'Actualizar pesos'
              : 'Guardar y cerrar total'}
        </button>

        {totalGuardado != null && (
          <>
            <a
              href={enlaceWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={marcarAvisado}
              className="rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Avisar al cliente por WhatsApp
            </a>

            {pedido.notificado_en && (
              <span className="self-center text-xs text-ave-oscuro/50">
                Ya se le avisó al cliente
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
