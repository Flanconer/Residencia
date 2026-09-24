'use client';

import { ShoppingBag } from 'lucide-react';
import { useCarrito } from '@/lib/utils/useCarrito';

export default function ContadorCarrito() {
  // Se cuentan productos distintos, no unidades: sumar "1.5 kg" con
  // "2 paquetes" daría un número sin sentido
  const { items } = useCarrito();
  const cantidadTotal = items.length;

  return (
    <a
      href="/carrito"
      className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-ave-cielo-claro"
      aria-label={`Carrito, ${cantidadTotal} productos`}
    >
      <ShoppingBag size={20} strokeWidth={1.75} />
      <span className="hidden sm:inline">Carrito</span>
      {cantidadTotal > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ave-rojo px-1 text-[11px] font-bold text-white">
          {cantidadTotal}
        </span>
      )}
    </a>
  );
}
