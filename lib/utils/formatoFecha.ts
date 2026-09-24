// =========================================================
// Fechas en hora de Pachuca
//
// El servidor (en Vercel) corre en hora UTC, que va 6 horas adelante de
// México. Si no se fija la zona horaria, a partir de las 6 pm el sistema
// cree que ya es el día siguiente y los pedidos de la noche aparecen en
// el día equivocado. Por eso TODO se calcula explícitamente en la zona
// de la Ciudad de México (Hidalgo usa la misma).
//
// Desde 2022 México ya no cambia de horario en verano, así que el
// desfase es fijo: UTC-06:00.
// =========================================================

export const ZONA_HORARIA = 'America/Mexico_City';
export const DESFASE_UTC = '-06:00';

// Fecha de hoy en Pachuca, formato 'YYYY-MM-DD'
export function fechaHoy(): string {
  // 'en-CA' da justo el formato AAAA-MM-DD
  return new Date().toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA });
}

// Inicio y fin de un día de Pachuca, listos para comparar en la base de datos
export function rangoDelDia(fecha: string): { inicio: string; fin: string } {
  return {
    inicio: `${fecha}T00:00:00${DESFASE_UTC}`,
    fin: `${fecha}T23:59:59.999${DESFASE_UTC}`,
  };
}

// "20 de septiembre de 2026". Acepta 'YYYY-MM-DD' o una fecha ISO completa.
export function formatearFechaLegible(fecha: string): string {
  // Una fecha sola ('2026-09-20') se interpretaría como medianoche UTC,
  // que en México todavía es el día anterior. Se ancla al mediodía local.
  const valor = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ? new Date(`${fecha}T12:00:00${DESFASE_UTC}`)
    : new Date(fecha);

  return valor.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA_HORARIA,
  });
}

// "20/09/2026, 14:30"
export function formatearFechaHora(fechaISO: string): string {
  return new Date(fechaISO).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_HORARIA,
  });
}

// "14:30"
export function formatearHora(fechaISO: string): string {
  return new Date(fechaISO).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_HORARIA,
  });
}
