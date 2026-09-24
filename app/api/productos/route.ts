import { NextResponse } from 'next/server';
import { obtenerProductosDisponibles } from '@/lib/models/productos';

export async function GET() {
  const productos = await obtenerProductosDisponibles();
  return NextResponse.json(productos);
}
