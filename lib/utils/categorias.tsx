import {
  Drumstick,
  Flame,
  Droplets,
  CookingPot,
  Sandwich,
  Beef,
  Bone,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

// Íconos por categoría. Los colores vienen de la base de datos
// (categorias.color_hex); aquí solo va lo visual que no cambia.
export const ICONOS_CATEGORIA: Record<string, LucideIcon> = {
  'pollo-natural': Drumstick,
  'empanizados': Flame,
  'marinados': Droplets,
  'para-guisar': CookingPot,
  'hamburguesas': Sandwich,
  'embutidos': Beef,
  'guisados': Utensils,
  'alitas': Bone,
};

export function iconoDe(slug?: string | null): LucideIcon {
  return (slug && ICONOS_CATEGORIA[slug]) || Utensils;
}

// Colores de respaldo, en el mismo orden que el catálogo. Se usan para
// la franja decorativa de la marca, que no depende de la base de datos.
export const FRANJA_MARCA = [
  '#FFFFFF', // pollo natural
  '#5FC9B5', // empanizados
  '#2E8B6F', // marinados
  '#F4C430', // para guisar
  '#F4934A', // hamburguesas
  '#7B4FA6', // embutidos
  '#F7B98C', // guisados
  '#C1272D', // alitas
];

// ¿El color es oscuro? Decide si el texto encima va blanco o marino.
// Usa la luminancia relativa, igual que las guías de accesibilidad.
export function esColorOscuro(hex: string): boolean {
  const limpio = hex.replace('#', '');
  if (limpio.length !== 6) return false;

  const canal = (i: number) => {
    const c = parseInt(limpio.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const luminancia = 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
  return luminancia < 0.4;
}

// Versión muy suave de un color, para fondos (ej. detrás del producto)
export function tinte(hex: string, opacidad = 0.18): string {
  const limpio = hex.replace('#', '');
  if (limpio.length !== 6) return 'transparent';
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
}

// El blanco del pollo natural necesita un tono visible para teñir fondos
export function colorVisible(hex?: string | null): string {
  if (!hex) return '#9DD3EE';
  return hex.toUpperCase() === '#FFFFFF' ? '#9DD3EE' : hex;
}
