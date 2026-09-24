import { NextRequest, NextResponse } from 'next/server';
import { eliminarDireccion, establecerPredeterminada } from '@/lib/models/direcciones';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await eliminarDireccion(Number(params.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 400 });
  }
}

// PATCH -> marcar como predeterminada
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await establecerPredeterminada(Number(params.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 });
  }
}
