import { NextRequest, NextResponse } from 'next/server';
import { guardarDireccion, obtenerMisDirecciones } from '@/lib/models/direcciones';
import { verificarCobertura } from '@/lib/utils/cobertura';

export async function GET() {
  try {
    return NextResponse.json(await obtenerMisDirecciones());
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.direccion_texto || body.latitud == null || body.longitud == null) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Se revalida la cobertura en el servidor. La validación del navegador
    // es solo para dar aviso rápido; nunca se confía en ella.
    const cobertura = verificarCobertura(
      body.latitud,
      body.longitud,
      body.codigo_postal
    );
    if (!cobertura.dentroDeCobertura) {
      return NextResponse.json({ error: cobertura.motivo }, { status: 400 });
    }

    const direccion = await guardarDireccion(body);
    return NextResponse.json(direccion, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo guardar la dirección' },
      { status: 400 }
    );
  }
}
