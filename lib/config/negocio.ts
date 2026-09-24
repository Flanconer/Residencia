// =========================================================
// Datos del negocio — TODO lo configurable está aquí
//
// Si algo cambia (teléfono, cuenta bancaria, horarios), se edita en
// este archivo y se refleja en toda la plataforma. Así, quien le dé
// mantenimiento después no tiene que buscar en 20 archivos.
// =========================================================

export const NEGOCIO = {
  nombre: 'AVE Paraíso',
  lema: 'Pollo fresco todos los días',

  // WhatsApp del negocio: 52 + 10 dígitos, sin espacios ni signos.
  // ⚠️ PENDIENTE: poner el número real. Mientras esté vacío, el botón
  // flotante abre WhatsApp sin destinatario.
  whatsapp: '',

  // Datos para transferencia. Se incluyen en el mensaje de WhatsApp que
  // se le manda al cliente con su total final.
  // ⚠️ PENDIENTE: confirmar con la jefa antes de publicar.
  transferencia: {
    banco: '',
    titular: '',
    clabe: '',
  },

  horarios: {
    entregas: 'Lunes a sábado',
    corte: '12:00 pm',
    descripcionCorte:
      'Pedidos antes de las 12:00 pm se entregan el mismo día; después, al día siguiente.',
  },

  zonaEntrega: 'Pachuca y zona conurbada',

  // Monto mínimo (aproximado) de un pedido para entregarlo a domicilio.
  // 0 = sin pedido mínimo.
  // ⚠️ PENDIENTE: confirmar el monto con la jefa. Está en 0 a propósito:
  // un monto inventado que se olvide cambiar rechazaría pedidos reales.
  pedidoMinimo: 0,

  // Foto principal de la página de inicio. Cuando tengas la foto, ponla en
  // la carpeta public/ (ej. public/hero.jpg) y escribe aquí '/hero.jpg'.
  // Mientras esté vacío, se muestra el logo.
  imagenHero: '',
} as const;

// ¿Ya se capturaron los datos bancarios?
export function hayDatosTransferencia(): boolean {
  const t = NEGOCIO.transferencia;
  return Boolean(t.banco && t.titular && t.clabe);
}
