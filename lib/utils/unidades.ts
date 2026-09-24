// =========================================================
// Cómo se pide cada producto
//
// - Por kilo (pollo natural): el cliente pide por cuartos de kilo,
//   como en la carnicería: ¼, ½, ¾, 1, 1¼... Mínimo un cuarto.
// - Por paquete (procesados): paquetes enteros de 500 g, 250 g, etc.
//
// En los dos casos el total es aproximado: el cobro real sale de la
// báscula.
// =========================================================

export interface InfoUnidad {
  porKilo: boolean;
  paso: number;
  minimo: number;
  inicial: number; // con qué cantidad arranca el selector
  atajos: number[]; // cantidades comunes para tocar directo
  pregunta: string; // "¿Cuánto quieres?"
  precioPor: string; // "por kg"
  formatear: (cantidad: number) => string; // "1½ kg", "3 paquetes de 500 g"
  formatearCorto: (cantidad: number) => string; // "1½ kg", "3"
}

const FRACCIONES: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

// 0.25 -> "¼", 1.5 -> "1½", 2 -> "2"
export function formatearKilos(cantidad: number): string {
  const entero = Math.floor(cantidad);
  const fraccion = Math.round((cantidad - entero) * 100) / 100;
  const simbolo = FRACCIONES[fraccion];

  if (!simbolo) return Number.isInteger(cantidad) ? String(cantidad) : cantidad.toFixed(2);
  return entero === 0 ? simbolo : `${entero}${simbolo}`;
}

export function infoUnidad(unidad: string): InfoUnidad {
  const normalizada = unidad.trim().toLowerCase();

  if (normalizada === 'kg' || normalizada === 'kilo') {
    return {
      porKilo: true,
      paso: 0.25,
      minimo: 0.25,
      inicial: 0.5, // medio kilo es lo más pedido
      atajos: [0.25, 0.5, 1, 2],
      pregunta: '¿Cuánto quieres?',
      precioPor: 'por kg',
      formatear: (c) => `${formatearKilos(c)} kg`,
      formatearCorto: (c) => `${formatearKilos(c)} kg`,
    };
  }

  return {
    porKilo: false,
    paso: 1,
    minimo: 1,
    inicial: 1,
    atajos: [],
    pregunta: '¿Cuántos paquetes?',
    precioPor: `por paquete de ${unidad}`,
    formatear: (c) => `${c} ${c === 1 ? 'paquete' : 'paquetes'} de ${unidad}`,
    formatearCorto: (c) => String(c),
  };
}

// Suma o resta un paso sin errores de redondeo (0.1 + 0.2 != 0.3)
export function ajustarCantidad(actual: number, delta: number, minimo: number): number {
  const nueva = Math.round((actual + delta) * 100) / 100;
  return Math.max(minimo, nueva);
}
