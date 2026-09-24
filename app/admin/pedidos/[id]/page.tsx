import { notFound } from 'next/navigation';
import { obtenerPedidoPorId } from '@/lib/models/pedidos';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { formatearFechaHora } from '@/lib/utils/formatoFecha';
import FormularioPesos from '@/components/FormularioPesos';
import SelectorEstado from '@/components/SelectorEstado';
import RegistroPago from '@/components/admin/RegistroPago';

export default async function PaginaDetallePedidoAdmin({
  params,
}: {
  params: { id: string };
}) {
  const pedido = await obtenerPedidoPorId(Number(params.id));
  if (!pedido) notFound();

  return (
    <div className="no-imprimir space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ave-oscuro">
            Pedido #{pedido.id}
          </h1>
          <p className="mt-1 text-sm text-ave-oscuro/60">
            {formatearFechaHora(pedido.creado_en)}
          </p>
        </div>
        <SelectorEstado pedidoId={pedido.id} estadoActual={pedido.estado} />
      </div>

      <div className="space-y-1 rounded-2xl bg-ave-cielo-claro p-5 text-sm text-ave-oscuro">
        <p>
          <strong>Cliente:</strong> {pedido.usuario?.nombre} (
          {pedido.usuario?.telefono})
        </p>
        <p className="mt-1">
          <strong>Entrega:</strong> {pedido.direccion_texto}
          {pedido.codigo_postal ? ` · CP ${pedido.codigo_postal}` : ''}
        </p>
        {pedido.referencias && (
          <p className="mt-1">
            <strong>Referencias:</strong> {pedido.referencias}
          </p>
        )}
        {pedido.notas && (
          <p className="mt-1">
            <strong>Indicaciones de entrega:</strong> {pedido.notas}
          </p>
        )}
        {pedido.latitud != null && pedido.longitud != null && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${pedido.latitud},${pedido.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-semibold text-ave-rojo hover:underline"
          >
            Abrir ubicación en Google Maps
          </a>
        )}
        <p className="mt-1">
          <strong>Pago:</strong>{' '}
          {pedido.metodo_pago === 'en_linea' ? 'En línea' : 'Al recibir'}
        </p>
      </div>

      <FormularioPesos pedido={pedido} />

      <RegistroPago pedido={pedido} />

      <div className="flex flex-wrap gap-3">
        <a
          href={`/admin/imprimir/${pedido.id}`}
          className="rounded-lg bg-ave-rojo px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Imprimir hoja para la planta
        </a>
        <a
          href="/admin"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ave-oscuro"
        >
          Volver a pedidos del día
        </a>
      </div>
    </div>
  );
}
