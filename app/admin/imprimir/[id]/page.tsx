import { notFound } from 'next/navigation';
import { obtenerPedidoPorId } from '@/lib/models/pedidos';
import HojaImpresion from '@/components/HojaImpresion';
import BotonImprimir from '@/components/BotonImprimir';
import { fechaHoy } from '@/lib/utils/formatoFecha';

// Vista dedicada para imprimir UN solo pedido. Reutiliza HojaImpresion
// pasándole un arreglo de un solo elemento.
export default async function PaginaImprimirPedido({
  params,
}: {
  params: { id: string };
}) {
  const pedido = await obtenerPedidoPorId(Number(params.id));
  if (!pedido) notFound();

  return (
    <div>
      <div className="no-imprimir mb-4">
        <BotonImprimir etiqueta="Imprimir esta hoja" />
      </div>
      <HojaImpresion pedidos={[pedido]} fecha={pedido.creado_en.split('T')[0] ?? fechaHoy()} />
    </div>
  );
}
