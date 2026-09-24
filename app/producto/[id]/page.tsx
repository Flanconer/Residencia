import { notFound } from 'next/navigation';
import { obtenerProductoPorId } from '@/lib/models/productos';
import DetalleProducto from '@/components/DetalleProducto';

export default async function PaginaDetalleProducto({
  params,
}: {
  params: { id: string };
}) {
  const producto = await obtenerProductoPorId(Number(params.id));

  if (!producto) notFound();

  return <DetalleProducto producto={producto} />;
}
