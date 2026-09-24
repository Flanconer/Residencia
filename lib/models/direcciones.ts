import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import type { Direccion } from '@/types';
import { obtenerUsuarioActual } from './usuarios';

// Direcciones guardadas del usuario con sesión iniciada.
// Las políticas RLS ya impiden ver las de otra persona, pero filtramos
// también aquí para no depender de una sola capa de seguridad.
export async function obtenerMisDirecciones(): Promise<Direccion[]> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return [];

  const supabase = crearClienteSupabaseServidor();
  const { data, error } = await supabase
    .from('direcciones')
    .select('*')
    .eq('usuario_id', usuario.id)
    .order('es_predeterminada', { ascending: false })
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

interface DatosDireccion {
  etiqueta?: string;
  direccion_texto: string;
  codigo_postal?: string;
  latitud: number;
  longitud: number;
  referencias?: string;
  es_predeterminada?: boolean;
}

export async function guardarDireccion(datos: DatosDireccion) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) throw new Error('Necesitas iniciar sesión para guardar direcciones');

  const supabase = crearClienteSupabaseServidor();

  // Solo puede haber una dirección predeterminada a la vez
  if (datos.es_predeterminada) {
    await supabase
      .from('direcciones')
      .update({ es_predeterminada: false })
      .eq('usuario_id', usuario.id);
  }

  const { data, error } = await supabase
    .from('direcciones')
    .insert({ ...datos, usuario_id: usuario.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarDireccion(id: number) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) throw new Error('No hay sesión activa');

  const supabase = crearClienteSupabaseServidor();
  const { error } = await supabase
    .from('direcciones')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario.id);

  if (error) throw error;
}

// Marca una dirección como la predeterminada (y desmarca las demás)
export async function establecerPredeterminada(id: number) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) throw new Error('No hay sesión activa');

  const supabase = crearClienteSupabaseServidor();

  await supabase
    .from('direcciones')
    .update({ es_predeterminada: false })
    .eq('usuario_id', usuario.id);

  const { error } = await supabase
    .from('direcciones')
    .update({ es_predeterminada: true })
    .eq('id', id)
    .eq('usuario_id', usuario.id);

  if (error) throw error;
}
