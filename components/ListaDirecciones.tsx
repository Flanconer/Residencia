'use client';

import { useState } from 'react';
import type { Direccion } from '@/types';
import SelectorUbicacion, { type UbicacionConfirmada } from './SelectorUbicacion';

export default function ListaDirecciones({
  direccionesIniciales,
}: {
  direccionesIniciales: Direccion[];
}) {
  const [direcciones, setDirecciones] = useState(direccionesIniciales);
  const [agregando, setAgregando] = useState(false);
  const [etiqueta, setEtiqueta] = useState('Casa');
  const [error, setError] = useState('');

  async function guardar(ubicacion: UbicacionConfirmada) {
    setError('');
    try {
      const respuesta = await fetch('/api/direcciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etiqueta,
          direccion_texto: ubicacion.direccionTexto,
          codigo_postal: ubicacion.codigoPostal,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
          referencias: ubicacion.referencias,
          es_predeterminada: direcciones.length === 0,
        }),
      });

      if (!respuesta.ok) throw new Error();

      const nueva = await respuesta.json();
      setDirecciones((prev) => [nueva, ...prev]);
      setAgregando(false);
    } catch {
      setError('No se pudo guardar la dirección. Intenta de nuevo.');
    }
  }

  async function eliminar(id: number) {
    setError('');
    try {
      const respuesta = await fetch(`/api/direcciones/${id}`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error();
      setDirecciones((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('No se pudo eliminar la dirección.');
    }
  }

  return (
    <div>
      {direcciones.length === 0 && !agregando && (
        <p className="mb-4 text-sm text-ave-oscuro/60">
          No tienes direcciones guardadas todavía.
        </p>
      )}

      <div className="mb-4 space-y-3">
        {direcciones.map((direccion) => (
          <div
            key={direccion.id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ave-oscuro">
                  {direccion.etiqueta ?? 'Dirección'}
                </p>
                {direccion.es_predeterminada && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ave-oscuro/70">
                    Predeterminada
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ave-oscuro/70">
                {direccion.direccion_texto}
                {direccion.codigo_postal ? ` · CP ${direccion.codigo_postal}` : ''}
              </p>
              {direccion.referencias && (
                <p className="mt-0.5 text-xs text-ave-oscuro/50">
                  {direccion.referencias}
                </p>
              )}
            </div>

            <button
              onClick={() => eliminar(direccion.id)}
              className="shrink-0 text-sm text-ave-oscuro/50 transition hover:text-ave-rojo"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-ave-rojo">{error}</p>}

      {agregando ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-ave-oscuro">
              ¿Cómo quieres llamarla?
            </label>
            <input
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="Casa, Trabajo..."
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
            />
          </div>

          <SelectorUbicacion
            onConfirmar={guardar}
            onCancelar={() => setAgregando(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setAgregando(true)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ave-oscuro transition hover:border-ave-rojo hover:text-ave-rojo"
        >
          + Agregar dirección
        </button>
      )}
    </div>
  );
}
