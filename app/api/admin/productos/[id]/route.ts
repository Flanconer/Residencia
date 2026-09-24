import { NextRequest, NextResponse } from 'next/server';
import { actualizarProducto } from '@/lib/models/productos';
import { esAdministrador } from '@/lib/models/usuarios';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const datos = await request.json();

  if ('precio' in datos && !(Number(datos.precio) > 0)) {
    return NextResponse.json({ error: 'El precio debe ser mayor a cero' }, { status: 400 });
  }

  try {
    return NextResponse.json(await actualizarProducto(Number(params.id), datos));
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 });
  }
}
