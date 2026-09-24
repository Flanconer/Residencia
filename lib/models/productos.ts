import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import type { ProductoConCategoria } from '@/types';

// Obtiene todos los productos disponibles, con su categoría
export async function obtenerProductosDisponibles() {
  const supabase = crearClienteSupabaseServidor();

  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('disponible', true)
    .order('categoria_id');

  if (error) throw error;
  return data;
}

// Obtiene solo los productos marcados como "destacado" (los más pedidos),
// para mostrarlos en la página principal en vez del catálogo completo
export async function obtenerProductosDestacados() {
  const supabase = crearClienteSupabaseServidor();

  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('disponible', true)
    .eq('destacado', true)
    .order('categoria_id');

  if (error) throw error;
  return data;
}

// Obtiene productos filtrados por el slug de categoría (usado en /catalogo).
// Si no se pasa slug, regresa todos los productos disponibles.
export async function obtenerProductosPorCategoria(slug?: string) {
  const supabase = crearClienteSupabaseServidor();

  // El "!inner" convierte el join en INNER JOIN, necesario para poder
  // filtrar por una columna de la tabla relacionada (categorias.slug)
  let consulta = supabase
    .from('productos')
    .select('*, categoria:categorias!inner(*)')
    .eq('disponible', true)
    .order('categoria_id');

  if (slug) {
    consulta = consulta.eq('categoria.slug', slug);
  }

  const { data, error } = await consulta;
  if (error) throw error;
  return data;
}

// Obtiene un producto por id
export async function obtenerProductoPorId(
  id: number
): Promise<ProductoConCategoria | null> {
  const supabase = crearClienteSupabaseServidor();

  // Se trae la categoría porque el detalle la necesita para saber si el
  // producto admite opciones de preparación (solo el pollo natural).
  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as ProductoConCategoria;
}

// Obtiene todas las categorías con sus colores de marca
export async function obtenerCategorias() {
  const supabase = crearClienteSupabaseServidor();

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('id');

  if (error) throw error;
  return data;
}

// Busca productos por nombre o descripción.
// `ilike` no distingue mayúsculas/minúsculas; el % a ambos lados
// permite coincidencias parciales ("nug" encuentra "Nuggets").
export async function buscarProductos(termino: string) {
  const texto = termino.trim();
  if (!texto) return [];

  const supabase = crearClienteSupabaseServidor();

  // Se escapan los comodines para que el usuario no pueda alterar el patrón
  const patron = `%${texto.replace(/[%_]/g, (c) => `\\${c}`)}%`;

  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('disponible', true)
    .or(`nombre.ilike.${patron},descripcion.ilike.${patron}`)
    .order('categoria_id')
    .limit(50);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------
// Administración del catálogo (solo panel de administración)
// Las políticas RLS ya impiden que un cliente modifique productos;
// las rutas API además verifican el rol antes de llamar a estas funciones.
// ---------------------------------------------------------

// Todos los productos, incluidos los no disponibles
export async function obtenerTodosLosProductos() {
  const supabase = crearClienteSupabaseServidor();
  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .order('categoria_id')
    .order('nombre');

  if (error) throw error;
  return data;
}

const CAMPOS_EDITABLES = [
  'nombre',
  'descripcion',
  'precio',
  'unidad',
  'imagen_url',
  'disponible',
  'destacado',
  'categoria_id',
] as const;

// Deja pasar solo los campos que se pueden editar desde el panel
function limpiarCampos(datos: Record<string, unknown>) {
  const limpio: Record<string, unknown> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (campo in datos) limpio[campo] = datos[campo];
  }
  return limpio;
}

export async function actualizarProducto(id: number, datos: Record<string, unknown>) {
  const supabase = crearClienteSupabaseServidor();
  const { data, error } = await supabase
    .from('productos')
    .update(limpiarCampos(datos))
    .eq('id', id)
    .select('*, categoria:categorias(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function crearProducto(datos: Record<string, unknown>) {
  const supabase = crearClienteSupabaseServidor();
  const { data, error } = await supabase
    .from('productos')
    .insert(limpiarCampos(datos))
    .select('*, categoria:categorias(*)')
    .single();

  if (error) throw error;
  return data;
}
