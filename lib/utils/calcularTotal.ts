import type { ItemCarrito } from '@/types';

// Calcula el total de una lista de items del carrito
export function calcularTotalCarrito(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
}

// Formatea un número como moneda en pesos mexicanos
export function formatearMoneda(cantidad: number): string {
  return cantidad.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}
