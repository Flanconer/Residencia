import { NextRequest, NextResponse } from 'next/server';
import { actualizarPerfil } from '@/lib/models/usuarios';

export async function PATCH(request: NextRequest) {
  try {
    const { nombre, telefono } = await request.json();

    if (typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    await actualizarPerfil({
      nombre: nombre.trim(),
      telefono: typeof telefono === 'string' ? telefono.trim() : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudieron guardar tus datos' }, { status: 400 });
  }
}
