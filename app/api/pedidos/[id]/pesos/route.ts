import { NextRequest, NextResponse } from 'next/server';
import { marcarNotificado, registrarPesos } from '@/lib/models/pedidos';
import { esAdministrador } from '@/lib/models/usuarios';

// POST /api/pedidos/[id]/pesos -> captura los pesos reales y cierra el total
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body.pesos) || body.pesos.length === 0) {
      return NextResponse.json({ error: 'Faltan los pesos' }, { status: 400 });
    }

    // Un peso de 0 o negativo sería un error de captura, no un dato válido
    for (const peso of body.pesos) {
      if (typeof peso.cantidadReal !== 'number' || peso.cantidadReal <= 0) {
        return NextResponse.json(
          { error: 'Todos los pesos deben ser mayores a cero' },
          { status: 400 }
        );
      }
    }

    const totalFinal = await registrarPesos(Number(params.id), body.pesos);

    if (body.marcarNotificado) {
      await marcarNotificado(Number(params.id));
    }

    return NextResponse.json({ totalFinal });
  } catch {
    return NextResponse.json(
      { error: 'No se pudieron registrar los pesos' },
      { status: 500 }
    );
  }
}
