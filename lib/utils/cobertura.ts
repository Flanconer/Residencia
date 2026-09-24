// =========================================================
// Zona de cobertura de reparto
//
// ⚠️ IMPORTANTE: estos valores son un punto de partida razonable, pero
// DEBES confirmarlos con el negocio antes de operar. Si el radio o los
// códigos postales no coinciden con la zona real de reparto, vas a
// rechazar clientes válidos o aceptar pedidos que no puedes entregar.
// Todo lo configurable está en este archivo, a propósito.
// =========================================================

// Centro aproximado de Pachuca de Soto (Plaza Independencia / Reloj Monumental)
export const CENTRO_PACHUCA = { lat: 20.1011, lng: -98.7591 };

// Radio de reparto en kilómetros desde el centro
export const RADIO_COBERTURA_KM = 12;

// Rango de códigos postales considerados dentro de cobertura.
// Pachuca de Soto y zona conurbada (Mineral de la Reforma) caen
// aproximadamente en este rango — verifícalo con el negocio.
export const CP_MINIMO = 42000;
export const CP_MAXIMO = 42199;

// Distancia en kilómetros entre dos puntos (fórmula de Haversine)
export function distanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // radio de la Tierra en km
  const aRad = (grados: number) => (grados * Math.PI) / 180;

  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ResultadoCobertura {
  dentroDeCobertura: boolean;
  motivo: string;
  distanciaKm: number;
}

// Verifica si unas coordenadas (y opcionalmente un CP) están dentro
// de la zona de reparto.
export function verificarCobertura(
  lat: number,
  lng: number,
  codigoPostal?: string | null
): ResultadoCobertura {
  const distancia = distanciaKm(lat, lng, CENTRO_PACHUCA.lat, CENTRO_PACHUCA.lng);

  // El código postal manda cuando lo tenemos: es más confiable que un
  // radio circular, porque la mancha urbana no es un círculo perfecto.
  if (codigoPostal && /^\d{5}$/.test(codigoPostal)) {
    const cp = Number(codigoPostal);
    const cpEnRango = cp >= CP_MINIMO && cp <= CP_MAXIMO;

    if (!cpEnRango) {
      return {
        dentroDeCobertura: false,
        motivo: `El código postal ${codigoPostal} está fuera de nuestra zona de entrega. Por ahora solo repartimos en Pachuca y su zona conurbada.`,
        distanciaKm: distancia,
      };
    }

    return {
      dentroDeCobertura: true,
      motivo: 'Dentro de la zona de entrega.',
      distanciaKm: distancia,
    };
  }

  // Sin código postal, caemos al radio como respaldo
  if (distancia > RADIO_COBERTURA_KM) {
    return {
      dentroDeCobertura: false,
      motivo: `La ubicación está a ${distancia.toFixed(
        1
      )} km del centro de Pachuca, fuera de nuestra zona de entrega de ${RADIO_COBERTURA_KM} km.`,
      distanciaKm: distancia,
    };
  }

  return {
    dentroDeCobertura: true,
    motivo: 'Dentro de la zona de entrega.',
    distanciaKm: distancia,
  };
}
