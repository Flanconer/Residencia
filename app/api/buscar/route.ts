import { NextRequest, NextResponse } from 'next/server';
import { buscarProductos } from '@/lib/models/productos';

export async function GET(request: NextRequest) {
  const termino = request.nextUrl.searchParams.get('q') ?? '';

  try {
    return NextResponse.json(await buscarProductos(termino));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
