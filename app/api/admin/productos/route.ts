import { NextRequest, NextResponse } from 'next/server';
import { crearProducto, obtenerTodosLosProductos } from '@/lib/models/productos';
import { esAdministrador } from '@/lib/models/usuarios';

export async function GET() {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  return NextResponse.json(await obtenerTodosLosProductos());
}

export async function POST(request: NextRequest) {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const datos = await request.json();

  if (!datos.nombre?.trim() || !(Number(datos.precio) > 0) || !datos.categoria_id) {
    return NextResponse.json(
      { error: 'Nombre, categoría y un precio mayor a cero son obligatorios' },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await crearProducto(datos), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 });
  }
}
