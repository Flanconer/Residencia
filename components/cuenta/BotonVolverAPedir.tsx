'use client';

import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import type { PedidoConDetalle } from '@/types';
import { useCarrito } from '@/lib/utils/useCarrito';

// Agrega al carrito lo mismo que se pidió la vez pasada, con sus mismas
// preparaciones e indicaciones. Los productos que ya no estén disponibles se omiten.
export default function BotonVolverAPedir({ pedido }: { pedido: PedidoConDetalle }) {
  const router = useRouter();
  const { agregarProducto } = useCarrito();

  function volverAPedir() {
    for (const item of pedido.items) {
      if (!item.producto?.disponible) continue;
      agregarProducto(item.producto, Number(item.cantidad), item.preparacion, item.nota);
    }
    router.push('/carrito');
  }

  return (
    <button
      onClick={volverAPedir}
      className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-ave-oscuro transition hover:border-ave-oscuro"
    >
      <RotateCcw size={15} />
      Volver a pedir
    </button>
  );
}
