// =========================================================
// Opciones de preparación por categoría
//
// Solo el pollo natural se puede pedir preparado de distintas formas,
// porque es lo único que se corta al momento en la planta. El resto de
// productos (empanizados, marinados, embutidos, etc.) ya vienen hechos
// y se venden en paquete cerrado.
//
// Para agregar o quitar opciones, edita este archivo. La primera de la
// lista es la que queda seleccionada por defecto.
// =========================================================

export const PREPARACIONES_POR_CATEGORIA: Record<string, string[]> = {
  'pollo-natural': ['Natural', 'Sin piel', 'Deshuesado', 'Sin piel y deshuesado'],
};

// Productos de la categoría "pollo natural" que NO se preparan: el huevo,
// y cortes que ya salen deshuesados y sin piel. Ofrecerles "sin piel" o
// "deshuesado" no tendría sentido.
// ⚠️ Confirmar esta lista con la planta. Se compara por palabra clave
// en el nombre, sin importar mayúsculas.
const PRODUCTOS_SIN_PREPARACION = ['huevo', 'molida', 'filete', 'fajita'];

// Devuelve las opciones de preparación de un producto, o null si se
// vende tal cual.
export function preparacionesDe(
  slugCategoria?: string | null,
  nombreProducto?: string | null
): string[] | null {
  if (!slugCategoria) return null;

  const opciones = PREPARACIONES_POR_CATEGORIA[slugCategoria];
  if (!opciones) return null;

  const nombre = (nombreProducto ?? '').toLowerCase();
  if (PRODUCTOS_SIN_PREPARACION.some((palabra) => nombre.includes(palabra))) {
    return null;
  }

  return opciones;
}

// Categorías donde el cliente puede dejar una nota para la planta
// ("partida en cuatro", "que sean 3 mollejas"). Solo pollo natural: es
// lo único que se corta al momento.
export const CATEGORIAS_CON_NOTAS = ['pollo-natural'];
export const LARGO_MAXIMO_NOTA = 200;

export function admiteNotas(slugCategoria?: string | null): boolean {
  return Boolean(slugCategoria && CATEGORIAS_CON_NOTAS.includes(slugCategoria));
}

// Identificador único de una línea del carrito. El mismo producto con
// preparación o nota distinta son dos líneas separadas: la planta tiene
// que prepararlas diferente.
export function claveItem(
  productoId: number,
  preparacion?: string | null,
  nota?: string | null
): string {
  return `${productoId}::${preparacion ?? ''}::${(nota ?? '').trim()}`;
}
