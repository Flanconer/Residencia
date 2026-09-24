'use client';

import { useState } from 'react';
import type { Producto } from '@/types';
import { useCarrito } from '@/lib/utils/useCarrito';

export default function BotonAgregarCarrito({ producto }: { producto: Producto }) {
  const { agregarProducto } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  function manejarClick() {
    agregarProducto(producto, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <button
      onClick={manejarClick}
      className="rounded bg-ave-morado px-6 py-2 text-white hover:opacity-90"
    >
      {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
    </button>
  );
}
