'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EstadoPedido } from '@/types';

const ESTADOS: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendiente' },
  { valor: 'en_preparacion', etiqueta: 'En preparación' },
  { valor: 'pesado', etiqueta: 'Pesado' },
  { valor: 'en_reparto', etiqueta: 'En reparto' },
  { valor: 'entregado', etiqueta: 'Entregado' },
  { valor: 'cancelado', etiqueta: 'Cancelado' },
];

export default function SelectorEstado({
  pedidoId,
  estadoActual,
}: {
  pedidoId: number;
  estadoActual: EstadoPedido;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoActual);
  const [guardando, setGuardando] = useState(false);

  async function cambiar(nuevo: EstadoPedido) {
    setEstado(nuevo);
    setGuardando(true);

    await fetch(`/api/pedidos/${pedidoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevo }),
    });

    setGuardando(false);
    router.refresh();
  }

  return (
    <select
      value={estado}
      disabled={guardando}
      onChange={(e) => cambiar(e.target.value as EstadoPedido)}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo disabled:opacity-50"
    >
      {ESTADOS.map((e) => (
        <option key={e.valor} value={e.valor}>
          {e.etiqueta}
        </option>
      ))}
    </select>
  );
}
