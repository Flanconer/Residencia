'use client';

import { useEffect, useState } from 'react';
import type { ItemCarrito, Producto } from '@/types';
import { calcularTotalCarrito } from './calcularTotal';
import { claveItem } from './preparaciones';

const CLAVE_STORAGE = 'ave-paraiso-carrito';
const EVENTO_CARRITO = 'ave-paraiso:carrito';

function leerCarrito(): ItemCarrito[] {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    localStorage.removeItem(CLAVE_STORAGE);
    return [];
  }
}

// Hook para manejar el carrito en el navegador, persistido en localStorage.
// Cada línea se identifica por producto + preparación: la misma pechuga
// "sin piel" y "natural" son dos líneas distintas, porque la planta las
// prepara diferente.
export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  // Cada componente que usa el carrito tiene su propia copia del estado.
  // Para que todas estén sincronizadas (ej. el contador del encabezado se
  // actualiza al agregar desde una tarjeta), se avisa con un evento.
  useEffect(() => {
    setItems(leerCarrito());

    const recargar = () => setItems(leerCarrito());
    window.addEventListener(EVENTO_CARRITO, recargar);
    window.addEventListener('storage', recargar); // otras pestañas
    return () => {
      window.removeEventListener(EVENTO_CARRITO, recargar);
      window.removeEventListener('storage', recargar);
    };
  }, []);

  function guardar(nuevosItems: ItemCarrito[]) {
    setItems(nuevosItems);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevosItems));
    window.dispatchEvent(new Event(EVENTO_CARRITO));
  }

  function agregarProducto(
    producto: Producto,
    cantidad: number = 1,
    preparacion?: string | null,
    nota?: string | null
  ) {
    const notaLimpia = nota?.trim() || null;
    const clave = claveItem(producto.id, preparacion, notaLimpia);
    const items = leerCarrito();
    const existente = items.find(
      (i) => claveItem(i.producto.id, i.preparacion, i.nota) === clave
    );

    if (existente) {
      guardar(
        items.map((i) =>
          claveItem(i.producto.id, i.preparacion, i.nota) === clave
            ? { ...i, cantidad: Math.round((i.cantidad + cantidad) * 100) / 100 }
            : i
        )
      );
    } else {
      guardar([
        ...items,
        { producto, cantidad, preparacion: preparacion ?? null, nota: notaLimpia },
      ]);
    }
  }

  function quitarItem(clave: string) {
    guardar(items.filter((i) => claveItem(i.producto.id, i.preparacion, i.nota) !== clave));
  }

  function cambiarCantidad(clave: string, cantidad: number) {
    if (cantidad <= 0) {
      quitarItem(clave);
      return;
    }
    guardar(
      items.map((i) =>
        claveItem(i.producto.id, i.preparacion, i.nota) === clave ? { ...i, cantidad } : i
      )
    );
  }

  function vaciarCarrito() {
    guardar([]);
  }

  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);

  return {
    items,
    cantidadTotal,
    agregarProducto,
    quitarItem,
    cambiarCantidad,
    vaciarCarrito,
    total: calcularTotalCarrito(items),
  };
}
