import { CheckCircle2 } from 'lucide-react';
import { obtenerPedidoPorId } from '@/lib/models/pedidos';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import FranjaMarca from '@/components/FranjaMarca';

export default async function PaginaPedidoConfirmado({
  params,
}: {
  params: { id: string };
}) {
  // Con sesión, el cliente ve el detalle de su pedido. Un invitado no
  // puede leerlo (las políticas RLS lo impiden, y está bien: si no,
  // cualquiera podría ver pedidos ajenos cambiando el número en la URL),
  // así que ve la confirmación sin el detalle.
  const pedido = await obtenerPedidoPorId(Number(params.id));

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <FranjaMarca alto="h-2" />
        <div className="p-8 text-center">
          <CheckCircle2 size={52} strokeWidth={1.5} className="mx-auto text-emerald-600" />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-ave-oscuro">
            Recibimos tu pedido #{params.id}
          </h1>
          <p className="mt-3 text-ave-oscuro/70">
            Lo preparamos, lo pesamos y te mandamos el total exacto por WhatsApp antes
            de salir a reparto.
          </p>

          {pedido && (
            <div className="mt-8 space-y-3 rounded-2xl bg-ave-cielo-claro p-5 text-left text-sm">
              <div>
                <p className="font-semibold text-ave-oscuro">Entrega en</p>
                <p className="text-ave-oscuro/70">{pedido.direccion_texto}</p>
              </div>
              <div>
                <p className="font-semibold text-ave-oscuro">Estimado</p>
                <p className="font-display text-xl font-bold text-ave-oscuro">
                  {formatearMoneda(pedido.total_estimado)}
                </p>
                <p className="text-xs text-ave-oscuro/50">
                  Se ajusta al peso real. Pagas al recibir, en efectivo o por
                  transferencia.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {pedido && (
              <a
                href="/mi-cuenta#pedidos"
                className="rounded-xl bg-ave-oscuro px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Ver mis pedidos
              </a>
            )}
            <a
              href="/catalogo"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-ave-oscuro transition hover:border-ave-oscuro"
            >
              Seguir comprando
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
