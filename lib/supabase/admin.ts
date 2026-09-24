import { createClient } from '@supabase/supabase-js';

// =========================================================
// Cliente con privilegios de servicio — SOLO PARA EL SERVIDOR
//
// Ignora las políticas RLS. Se usa únicamente para operaciones que el
// servidor ya validó y que un invitado sin sesión necesita hacer:
// registrar su pedido. Sin esto, las políticas RLS impiden que alguien
// sin cuenta guarde un pedido.
//
// ⚠️ La llave SUPABASE_SERVICE_ROLE_KEY NUNCA debe llevar el prefijo
// NEXT_PUBLIC_: eso la mandaría al navegador y cualquiera tendría acceso
// total a la base de datos. Nunca importes este archivo desde un
// componente con 'use client'.
// =========================================================

export function crearClienteSupabaseServicio() {
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!llave) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno (ver .env.local.example)'
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, llave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
