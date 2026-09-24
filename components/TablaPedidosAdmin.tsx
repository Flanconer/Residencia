import type { PedidoConDetalle } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { formatearHora } from '@/lib/utils/formatoFecha';

const ESTADOS: Record<string, { etiqueta: string; clase: string }> = {
  pendiente: { etiqueta: 'Nuevo', clase: 'bg-ave-rojo text-white' },
  en_preparacion: { etiqueta: 'Preparando', clase: 'bg-amber-100 text-amber-800' },
  pesado: { etiqueta: 'Pesado', clase: 'bg-sky-100 text-sky-800' },
  en_reparto: { etiqueta: 'En reparto', clase: 'bg-indigo-100 text-indigo-800' },
  entregado: { etiqueta: 'Entregado', clase: 'bg-emerald-100 text-emerald-800' },
  cancelado: { etiqueta: 'Cancelado', clase: 'bg-slate-100 text-slate-500' },
};

export default function TablaPedidosAdmin({ pedidos }: { pedidos: PedidoConDetalle[] }) {
  if (pedidos.length === 0) {
    return (
      <div className="no-imprimir rounded-2xl bg-ave-cielo-claro p-8 text-center">
        <p className="font-display text-lg font-bold text-ave-oscuro">
          No hay pedidos para este día.
        </p>
        <p className="mt-1 text-sm text-ave-oscuro/60">
          Los pedidos nuevos aparecen aquí automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="no-imprimir overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold text-ave-oscuro/60">
          <tr>
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Productos</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Pago</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedidos.map((pedido) => {
            const estado = ESTADOS[pedido.estado] ?? ESTADOS.pendiente;

            return (
              <tr key={pedido.id} className="transition hover:bg-slate-50">
                <td className="px-4 py-3">
                  <a
                    href={`/admin/pedidos/${pedido.id}`}
                    className="font-bold text-ave-oscuro hover:text-ave-rojo"
                  >
                    #{pedido.id}
                  </a>
                  <p className="text-xs text-ave-oscuro/50">{formatearHora(pedido.creado_en)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ave-oscuro">{pedido.usuario?.nombre}</p>
                  <p className="text-xs text-ave-oscuro/50">{pedido.usuario?.telefono}</p>
                </td>
                <td className="max-w-xs px-4 py-3 text-ave-oscuro/70">
                  {pedido.items
                    .map(
                      (i) =>
                        `${i.producto.nombre}${i.preparacion ? ` (${i.preparacion})` : ''} ×${i.cantidad}${
                          i.nota ? ' ✎' : ''
                        }`
                    )
                    .join(', ')}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}>
                    {estado.etiqueta}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {pedido.total_final != null ? (
                    <span className="font-bold text-ave-oscuro">
                      {formatearMoneda(pedido.total_final)}
                    </span>
                  ) : (
                    <span className="text-ave-oscuro/50">
                      ~{formatearMoneda(pedido.total_estimado)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {pedido.pagado ? (
                    <span className="text-xs font-semibold text-emerald-700">
                      Pagado · {pedido.metodo_cobro === 'transferencia' ? 'transf.' : 'efectivo'}
                    </span>
                  ) : (
                    <span className="text-xs text-ave-oscuro/40">Pendiente</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
