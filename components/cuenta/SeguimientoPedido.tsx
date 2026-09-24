import type { EstadoPedido } from '@/types';

const PASOS: { estado: EstadoPedido; etiqueta: string }[] = [
  { estado: 'pendiente', etiqueta: 'Recibido' },
  { estado: 'en_preparacion', etiqueta: 'Preparando' },
  { estado: 'pesado', etiqueta: 'Pesado' },
  { estado: 'en_reparto', etiqueta: 'En camino' },
  { estado: 'entregado', etiqueta: 'Entregado' },
];

// Barra de avance del pedido, para que el cliente vea en qué va
export default function SeguimientoPedido({ estado }: { estado: EstadoPedido }) {
  if (estado === 'cancelado') {
    return (
      <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-ave-oscuro/60">
        Pedido cancelado
      </p>
    );
  }

  const indice = Math.max(0, PASOS.findIndex((p) => p.estado === estado));

  return (
    <div>
      <div className="flex gap-1.5" aria-hidden>
        {PASOS.map((paso, i) => (
          <span
            key={paso.estado}
            className={`h-1.5 flex-1 rounded-full ${i <= indice ? 'bg-ave-rojo' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-ave-oscuro">{PASOS[indice].etiqueta}</p>
    </div>
  );
}
