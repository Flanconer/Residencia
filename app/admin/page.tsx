import { obtenerPedidosPorDia } from '@/lib/models/pedidos';
import { fechaHoy, formatearFechaLegible } from '@/lib/utils/formatoFecha';
import TablaPedidosAdmin from '@/components/TablaPedidosAdmin';
import HojaImpresion from '@/components/HojaImpresion';
import BotonImprimir from '@/components/BotonImprimir';
import ResumenDia from '@/components/admin/ResumenDia';
import AvisoPedidosNuevos from '@/components/admin/AvisoPedidosNuevos';

export default async function PaginaAdmin({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const hoy = fechaHoy();
  const fecha = searchParams.fecha ?? hoy;
  const pedidos = await obtenerPedidosPorDia(fecha);
  const esHoy = fecha === hoy;

  return (
    <div className="space-y-6">
      <div className="no-imprimir flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ave-oscuro">
            {esHoy ? 'Pedidos de hoy' : 'Pedidos del día'}
          </h1>
          <p className="mt-1 capitalize text-ave-oscuro/60">{formatearFechaLegible(fecha)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2">
            <input
              type="date"
              name="fecha"
              defaultValue={fecha}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-oscuro"
            />
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ave-oscuro transition hover:border-ave-oscuro">
              Ver día
            </button>
          </form>
          {!esHoy && (
            <a
              href="/admin"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ave-rojo hover:underline"
            >
              Volver a hoy
            </a>
          )}
          <BotonImprimir etiqueta="Imprimir hoja del día" />
        </div>
      </div>

      {esHoy && (
        <AvisoPedidosNuevos fecha={fecha} idsIniciales={pedidos.map((p) => p.id)} />
      )}

      <ResumenDia pedidos={pedidos} />

      <TablaPedidosAdmin pedidos={pedidos} />

      <HojaImpresion pedidos={pedidos} fecha={fecha} />
    </div>
  );
}
