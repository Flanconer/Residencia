import type { PedidoConDetalle } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';

// Lo primero que ve la secretaria: cuánto trabajo hay y cuánto se ha cobrado
export default function ResumenDia({ pedidos }: { pedidos: PedidoConDetalle[] }) {
  const activos = pedidos.filter((p) => p.estado !== 'cancelado');

  const porPesar = activos.filter((p) => ['pendiente', 'en_preparacion'].includes(p.estado));
  const enReparto = activos.filter((p) => ['pesado', 'en_reparto'].includes(p.estado));
  const entregados = activos.filter((p) => p.estado === 'entregado');

  const cobrado = activos
    .filter((p) => p.pagado)
    .reduce((s, p) => s + Number(p.total_final ?? p.total_estimado), 0);

  const porCobrar = activos
    .filter((p) => !p.pagado && p.total_final != null)
    .reduce((s, p) => s + Number(p.total_final), 0);

  const tarjetas = [
    { etiqueta: 'Por preparar y pesar', valor: String(porPesar.length), resaltar: porPesar.length > 0 },
    { etiqueta: 'Listos o en camino', valor: String(enReparto.length) },
    { etiqueta: 'Entregados', valor: String(entregados.length) },
    { etiqueta: 'Cobrado', valor: formatearMoneda(cobrado) },
    { etiqueta: 'Pesado, falta cobrar', valor: formatearMoneda(porCobrar) },
  ];

  return (
    <div className="no-imprimir grid grid-cols-2 gap-3 md:grid-cols-5">
      {tarjetas.map((t) => (
        <div
          key={t.etiqueta}
          className={`rounded-2xl p-4 ${t.resaltar ? 'bg-ave-rojo text-white' : 'bg-ave-cielo-claro text-ave-oscuro'}`}
        >
          <p className="font-display text-2xl font-extrabold">{t.valor}</p>
          <p className={`mt-1 text-xs font-semibold ${t.resaltar ? 'text-white/80' : 'text-ave-oscuro/60'}`}>
            {t.etiqueta}
          </p>
        </div>
      ))}
    </div>
  );
}
