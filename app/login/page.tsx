'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteSupabase } from '@/lib/supabase/client';
import MarcoAcceso from '@/components/MarcoAcceso';
import CampoFormulario from '@/components/CampoFormulario';

export default function PaginaLogin() {
  const router = useRouter();
  const supabase = crearClienteSupabase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { data, error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (errorLogin || !data.user) {
      setCargando(false);
      setError('El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.');
      return;
    }

    // Según el rol: al panel de administración o a la cuenta del cliente
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_id', data.user.id)
      .maybeSingle();

    router.push(perfil?.rol === 'admin' ? '/admin' : '/mi-cuenta');
    router.refresh();
  }

  return (
    <MarcoAcceso titulo="Iniciar sesión" subtitulo="Qué gusto verte de nuevo.">
      <form onSubmit={manejarSubmit} className="space-y-4">
        <CampoFormulario
          etiqueta="Correo"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CampoFormulario
          etiqueta="Contraseña"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-ave-rojo">
            {error}
          </p>
        )}

        <button
          disabled={cargando}
          className="w-full rounded-xl bg-ave-rojo px-6 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {cargando ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ave-oscuro/60">
        ¿Primera vez aquí?{' '}
        <a href="/registro" className="font-semibold text-ave-rojo hover:underline">
          Crea tu cuenta
        </a>
      </p>
    </MarcoAcceso>
  );
}
