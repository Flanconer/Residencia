import { createBrowserClient } from '@supabase/ssr';

// Cliente para usar dentro de componentes del navegador ('use client')
export function crearClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
