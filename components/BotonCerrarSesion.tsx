'use client';

import { useRouter } from 'next/navigation';
import { crearClienteSupabase } from '@/lib/supabase/client';

export default function BotonCerrarSesion() {
  const router = useRouter();
  const supabase = crearClienteSupabase();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={cerrarSesion}
      className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ave-oscuro transition hover:border-ave-rojo hover:text-ave-rojo"
    >
      Cerrar sesión
    </button>
  );
}
