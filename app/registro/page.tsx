'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteSupabase } from '@/lib/supabase/client';
import MarcoAcceso from '@/components/MarcoAcceso';
import CampoFormulario from '@/components/CampoFormulario';

export default function PaginaRegistro() {
  const router = useRouter();
  const supabase = crearClienteSupabase();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [pendienteConfirmar, setPendienteConfirmar] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña necesita al menos 8 caracteres.');
      return;
    }

    setCargando(true);

    // `options.data` lo usa el trigger de la base de datos para crear la
    // fila del cliente en la tabla `usuarios`
    const { data, error: errorRegistro } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, telefono } },
    });

    setCargando(false);

    if (errorRegistro) {
      setError(
        errorRegistro.message.includes('already registered')
          ? 'Ya existe una cuenta con ese correo. Inicia sesión con él.'
          : 'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.'
      );
      return;
    }

    if (!data.session) {
      setPendienteConfirmar(true);
      return;
    }

    router.push('/mi-cuenta');
    router.refresh();
  }

  if (pendienteConfirmar) {
    return (
      <MarcoAcceso titulo="Revisa tu correo" subtitulo={`Te enviamos un enlace a ${email}.`}>
        <p className="text-ave-oscuro/70">
          Abre el enlace para confirmar tu cuenta y después inicia sesión.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-xl bg-ave-rojo px-6 py-3.5 font-semibold text-white transition hover:bg-red-700"
        >
          Ir a iniciar sesión
        </a>
      </MarcoAcceso>
    );
  }

  return (
    <MarcoAcceso
      titulo="Crea tu cuenta"
      subtitulo="Guarda tus direcciones y pide más rápido."
    >
      <form onSubmit={manejarSubmit} className="space-y-4">
        <CampoFormulario
          etiqueta="Nombre completo"
          required
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <CampoFormulario
          etiqueta="Teléfono (WhatsApp)"
          required
          type="tel"
          autoComplete="tel"
          placeholder="771 123 4567"
          ayuda="Aquí te mandamos el total final de cada pedido."
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
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
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres."
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
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ave-oscuro/60">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="font-semibold text-ave-rojo hover:underline">
          Inicia sesión
        </a>
      </p>
    </MarcoAcceso>
  );
}
