import { NextRequest, NextResponse } from 'next/server';

// Convierte coordenadas GPS en una dirección legible y su código postal,
// usando Nominatim de OpenStreetMap (gratuito, sin API key).
//
// Se hace desde el servidor y no desde el navegador por dos razones:
// 1. Nominatim pide un User-Agent identificable en su política de uso.
// 2. Evita exponer las peticiones del cliente a un tercero directamente.
//
// Política de uso de Nominatim: máximo 1 petición por segundo.
// Si el negocio crece, conviene migrar a un servicio de pago
// (Google Geocoding, Mapbox) con mayor límite.

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Faltan coordenadas' }, { status: 400 });
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
      `&zoom=18&addressdetails=1&accept-language=es`;

    const respuesta = await fetch(url, {
      headers: {
        'User-Agent': 'AVE-Paraiso-Ecommerce/1.0 (contacto@aveparaiso.mx)',
      },
      // Cachea 1 hora: la misma coordenada siempre da la misma dirección
      next: { revalidate: 3600 },
    });

    if (!respuesta.ok) throw new Error('Nominatim no respondió');

    const datos = await respuesta.json();
    const dir = datos.address ?? {};

    // Armamos una dirección corta y legible a partir de las partes
    const partes = [
      dir.road,
      dir.house_number,
      dir.neighbourhood ?? dir.suburb ?? dir.quarter,
      dir.city ?? dir.town ?? dir.village,
    ].filter(Boolean);

    return NextResponse.json({
      direccion: partes.join(', ') || datos.display_name || '',
      codigoPostal: dir.postcode ?? null,
      colonia: dir.neighbourhood ?? dir.suburb ?? null,
      ciudad: dir.city ?? dir.town ?? dir.village ?? null,
    });
  } catch {
    // Si falla la geocodificación no bloqueamos al cliente:
    // puede escribir su dirección a mano.
    return NextResponse.json(
      { direccion: '', codigoPostal: null, error: 'No se pudo obtener la dirección' },
      { status: 200 }
    );
  }
}
