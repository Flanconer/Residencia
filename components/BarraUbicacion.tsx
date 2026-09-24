'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import type { Direccion } from '@/types';
import { CENTRO_PACHUCA, verificarCobertura } from '@/lib/utils/cobertura';

const CLAVE_STORAGE = 'ave-paraiso-direccion-guardada';

interface UbicacionLocal {
  texto: string;
  codigoPostal: string;
}

// Barra "Enviar a..." estilo Mercado Libre.
// - Con sesión: muestra la dirección predeterminada del cliente y permite
//   cambiar entre sus direcciones guardadas.
// - Sin sesión: permite capturar una dirección rápida (GPS o código
//   postal) para saber desde el inicio si hay cobertura.
export default function BarraUbicacion() {
  const [direcciones, setDirecciones] = useState<Direccion[] | null>(null);
  const [local, setLocal] = useState<UbicacionLocal | null>(null);
  const [abierto, setAbierto] = useState(false);

  const [texto, setTexto] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [buscandoGps, setBuscandoGps] = useState(false);

  useEffect(() => {
    // Ubicación capturada como invitado
    try {
      const previo = localStorage.getItem(CLAVE_STORAGE);
      if (previo) setLocal(JSON.parse(previo));
    } catch {
      localStorage.removeItem(CLAVE_STORAGE);
    }

    // Si hay sesión, sus direcciones guardadas mandan
    fetch('/api/direcciones')
      .then((r) => (r.ok ? r.json() : null))
      .then((datos) => setDirecciones(datos))
      .catch(() => setDirecciones(null));
  }, []);

  const haySesion = direcciones !== null;
  const predeterminada =
    direcciones?.find((d) => d.es_predeterminada) ?? direcciones?.[0] ?? null;

  const etiqueta = predeterminada
    ? `${predeterminada.etiqueta ?? 'Enviar a'}: ${predeterminada.direccion_texto}`
    : local?.texto
      ? `Enviar a: ${local.texto}`
      : 'Ingresa tu dirección';

  async function elegir(direccion: Direccion) {
    setDirecciones(
      (prev) =>
        prev?.map((d) => ({ ...d, es_predeterminada: d.id === direccion.id })) ?? prev
    );
    setAbierto(false);
    // Queda como predeterminada: el checkout la precarga
    await fetch(`/api/direcciones/${direccion.id}`, { method: 'PATCH' });
  }

  function usarGps() {
    if (!navigator.geolocation) {
      setMensaje('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setBuscandoGps(true);
    setMensaje('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `/api/geocodificar?lat=${coords.latitude}&lng=${coords.longitude}`
          );
          const datos = await r.json();
          if (datos.direccion) setTexto(datos.direccion);
          if (datos.codigoPostal) setCodigoPostal(datos.codigoPostal);

          const cobertura = verificarCobertura(
            coords.latitude,
            coords.longitude,
            datos.codigoPostal
          );
          setMensaje(
            cobertura.dentroDeCobertura ? '✓ Sí entregamos en tu zona.' : cobertura.motivo
          );
        } catch {
          setMensaje('No pudimos identificar tu dirección. Escríbela a mano.');
        } finally {
          setBuscandoGps(false);
        }
      },
      () => {
        setBuscandoGps(false);
        setMensaje('No pudimos obtener tu ubicación. Revisa los permisos del navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function guardarLocal() {
    if (/^\d{5}$/.test(codigoPostal)) {
      const cobertura = verificarCobertura(
        CENTRO_PACHUCA.lat,
        CENTRO_PACHUCA.lng,
        codigoPostal
      );
      if (!cobertura.dentroDeCobertura) {
        setMensaje(cobertura.motivo);
        return;
      }
    }
    const nueva = { texto: texto.trim(), codigoPostal: codigoPostal.trim() };
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nueva));
    setLocal(nueva);
    setAbierto(false);
  }

  function abrir() {
    setTexto(local?.texto ?? '');
    setCodigoPostal(local?.codigoPostal ?? '');
    setMensaje('');
    setAbierto((v) => !v);
  }

  const esError = mensaje && !mensaje.startsWith('✓');

  return (
    <div className="relative min-w-0">
      <button
        onClick={abrir}
        className="flex min-w-0 items-center gap-1.5 text-sm text-white/90 transition hover:text-white"
      >
        <MapPin size={16} strokeWidth={2} className="shrink-0 text-ave-cielo" />
        <span className="truncate">{etiqueta}</span>
        <ChevronDown size={14} className="shrink-0 opacity-60" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-ave-oscuro shadow-xl">
          {haySesion ? (
            <>
              <p className="mb-3 font-semibold">¿A dónde enviamos tu pedido?</p>

              {direcciones && direcciones.length > 0 ? (
                <div className="space-y-2">
                  {direcciones.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => elegir(d)}
                      className={`block w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        d.es_predeterminada
                          ? 'border-ave-rojo bg-red-50'
                          : 'border-slate-200 hover:border-ave-oscuro'
                      }`}
                    >
                      <span className="font-semibold">{d.etiqueta ?? 'Dirección'}</span>
                      <span className="block truncate text-ave-oscuro/60">
                        {d.direccion_texto}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ave-oscuro/60">
                  Todavía no tienes direcciones guardadas.
                </p>
              )}

              <a
                href="/mi-cuenta#direcciones"
                className="mt-3 block text-center text-sm font-semibold text-ave-rojo hover:underline"
              >
                {direcciones?.length ? 'Administrar direcciones' : 'Agregar una dirección'}
              </a>
            </>
          ) : (
            <>
              <p className="mb-3 font-semibold">¿Dónde quieres recibir tu pedido?</p>

              <button
                type="button"
                onClick={usarGps}
                disabled={buscandoGps}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition hover:border-ave-rojo hover:text-ave-rojo disabled:opacity-50"
              >
                <MapPin size={16} />
                {buscandoGps ? 'Buscando...' : 'Usar mi ubicación actual'}
              </button>

              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Calle, número, colonia"
                className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
              />
              <input
                value={codigoPostal}
                onChange={(e) => {
                  setCodigoPostal(e.target.value);
                  setMensaje('');
                }}
                inputMode="numeric"
                maxLength={5}
                placeholder="Código postal"
                className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
              />

              {mensaje && (
                <p
                  className={`mb-3 rounded-xl px-3 py-2 text-xs ${
                    esError ? 'bg-red-50 text-ave-rojo' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {mensaje}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={guardarLocal}
                  className="flex-1 rounded-xl bg-ave-rojo px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setAbierto(false)}
                  className="rounded-xl px-3 py-2 text-sm text-ave-oscuro/60"
                >
                  Cancelar
                </button>
              </div>

              <p className="mt-3 text-xs text-ave-oscuro/50">
                <a href="/login" className="font-semibold text-ave-rojo">
                  Inicia sesión
                </a>{' '}
                para usar tus direcciones guardadas.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
