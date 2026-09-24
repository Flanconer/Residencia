'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CampoFormulario from '@/components/CampoFormulario';

export default function FormularioPerfil({
  nombreInicial,
  telefonoInicial,
  email,
}: {
  nombreInicial: string;
  telefonoInicial: string;
  email: string;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [estado, setEstado] = useState<'quieto' | 'guardando' | 'guardado' | 'error'>(
    'quieto'
  );

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('guardando');

    const r = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono }),
    });

    setEstado(r.ok ? 'guardado' : 'error');
    if (r.ok) router.refresh();
  }

  return (
    <form onSubmit={guardar} className="max-w-md space-y-4">
      <CampoFormulario
        etiqueta="Nombre completo"
        required
        value={nombre}
        onChange={(e) => {
          setNombre(e.target.value);
          setEstado('quieto');
        }}
      />
      <CampoFormulario
        etiqueta="Teléfono (WhatsApp)"
        type="tel"
        ayuda="Aquí te mandamos el total final de cada pedido."
        value={telefono}
        onChange={(e) => {
          setTelefono(e.target.value);
          setEstado('quieto');
        }}
      />
      <CampoFormulario etiqueta="Correo" value={email} disabled readOnly />

      <div className="flex items-center gap-3">
        <button
          disabled={estado === 'guardando'}
          className="rounded-xl bg-ave-oscuro px-5 py-3 font-semibold text-white transition hover:bg-black disabled:opacity-50"
        >
          {estado === 'guardando' ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {estado === 'guardado' && (
          <span className="text-sm font-semibold text-emerald-700">Cambios guardados</span>
        )}
        {estado === 'error' && (
          <span className="text-sm text-ave-rojo">No se pudo guardar. Intenta de nuevo.</span>
        )}
      </div>
    </form>
  );
}
