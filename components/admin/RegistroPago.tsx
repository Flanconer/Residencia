'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Landmark } from 'lucide-react';
import type { MetodoCobro, PedidoConDetalle } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { formatearFechaHora } from '@/lib/utils/formatoFecha';

// La secretaria marca cómo pagó el cliente. Queda registrado quién pagó,
// cuándo y cómo: hoy eso se lleva de memoria.
export default function RegistroPago({ pedido }: { pedido: PedidoConDetalle }) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function registrar(pago: MetodoCobro | null) {
    setGuardando(true);
    setError('');

    const r = await fetch(`/api/pedidos/${pedido.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pago ? { pago, estado: 'entregado' } : { pago: null }),
    });

    setGuardando(false);
    if (!r.ok) {
      setError('No se pudo registrar el pago. Intenta de nuevo.');
      return;
    }
    router.refresh();
  }

  if (pedido.pagado) {
    return (
      <div className="no-imprimir flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-5">
        <div>
          <p className="font-display text-lg font-bold text-emerald-800">
            Pagado por {pedido.metodo_cobro === 'transferencia' ? 'transferencia' : 'efectivo'}
          </p>
          {pedido.pagado_en && (
            <p className="text-sm text-emerald-700/80">{formatearFechaHora(pedido.pagado_en)}</p>
          )}
        </div>
        <button
          onClick={() => registrar(null)}
          disabled={guardando}
          className="text-sm font-semibold text-emerald-800/70 hover:underline disabled:opacity-50"
        >
          Deshacer
        </button>
      </div>
    );
  }

  const sinPesar = pedido.total_final == null;

  return (
    <div className="no-imprimir rounded-2xl border border-slate-200 p-5">
      <h2 className="font-display text-lg font-bold text-ave-oscuro">Registrar pago</h2>
      <p className="mt-1 text-sm text-ave-oscuro/60">
        {sinPesar
          ? 'Primero captura los pesos para cerrar el total.'
          : `Total a cobrar: ${formatearMoneda(Number(pedido.total_final))}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => registrar('efectivo')}
          disabled={guardando || sinPesar}
          className="flex items-center gap-2 rounded-xl bg-ave-oscuro px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
        >
          <Banknote size={18} />
          Pagó en efectivo
        </button>
        <button
          onClick={() => registrar('transferencia')}
          disabled={guardando || sinPesar}
          className="flex items-center gap-2 rounded-xl bg-ave-oscuro px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
        >
          <Landmark size={18} />
          Pagó por transferencia
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-ave-rojo">{error}</p>}
    </div>
  );
}
