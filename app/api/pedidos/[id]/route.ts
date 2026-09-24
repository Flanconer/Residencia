import { NextRequest, NextResponse } from 'next/server';
import {
  actualizarEstadoPedido,
  marcarNotificado,
  obtenerPedidoPorId,
  registrarPago,
} from '@/lib/models/pedidos';
import { esAdministrador } from '@/lib/models/usuarios';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const pedido = await obtenerPedidoPorId(Number(params.id));
  if (!pedido) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(pedido);
}

// Cambiar el estado de un pedido es una acción de operación interna
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();

  if (body.estado) {
    await actualizarEstadoPedido(Number(params.id), body.estado);
  }

  if (body.marcarNotificado) {
    await marcarNotificado(Number(params.id));
  }

  // pago: 'efectivo' | 'transferencia' | null (null = desmarcar)
  if ('pago' in body) {
    if (body.pago !== null && !['efectivo', 'transferencia'].includes(body.pago)) {
      return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 });
    }
    await registrarPago(Number(params.id), body.pago);
  }

  return NextResponse.json({ ok: true });
}
