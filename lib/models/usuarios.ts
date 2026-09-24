import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { crearClienteSupabaseServicio } from '@/lib/supabase/admin';
import type { Usuario } from '@/types';

interface DatosUsuario {
  nombre: string;
  telefono: string;
  email?: string;
}

// Devuelve la fila de `usuarios` ligada a la sesión actual, o null si
// no hay nadie con sesión iniciada.
export async function obtenerUsuarioActual(): Promise<Usuario | null> {
  const supabase = crearClienteSupabaseServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  return data;
}

// ¿El usuario con sesión iniciada es administrador?
export async function esAdministrador(): Promise<boolean> {
  const usuario = await obtenerUsuarioActual();
  return usuario?.rol === 'admin';
}

// Actualiza los datos de perfil del usuario con sesión iniciada
export async function actualizarPerfil(datos: { nombre?: string; telefono?: string }) {
  const supabase = crearClienteSupabaseServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('usuarios')
    .update(datos)
    .eq('auth_id', user.id);

  if (error) throw error;
}

// Usada al pagar. Si hay sesión iniciada devuelve ese usuario (y de paso
// completa su teléfono si faltaba). Si no, busca por teléfono o crea un
// usuario invitado, para que se pueda comprar sin registrarse.
export async function obtenerOCrearUsuario(datos: DatosUsuario) {
  const supabase = crearClienteSupabaseServidor();

  const usuarioSesion = await obtenerUsuarioActual();
  if (usuarioSesion) {
    if (!usuarioSesion.telefono && datos.telefono) {
      await supabase
        .from('usuarios')
        .update({ telefono: datos.telefono })
        .eq('id', usuarioSesion.id);
    }
    return usuarioSesion;
  }

  // Invitado: sin sesión, RLS no le deja buscarse ni crearse. Lo hace el
  // servidor con el cliente de servicio. Solo se llega aquí desde
  // /api/pedidos, que ya validó los datos.
  const servicio = crearClienteSupabaseServicio();

  const { data: existente } = await servicio
    .from('usuarios')
    .select('*')
    .eq('telefono', datos.telefono)
    .is('auth_id', null)
    .maybeSingle();

  if (existente) return existente;

  const { data: nuevo, error } = await servicio
    .from('usuarios')
    .insert({
      nombre: datos.nombre,
      telefono: datos.telefono,
      email: datos.email ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return nuevo;
}
