'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CENTRO_PACHUCA, verificarCobertura } from '@/lib/utils/cobertura';

export interface UbicacionConfirmada {
  direccionTexto: string;
  codigoPostal: string;
  referencias: string;
  latitud: number;
  longitud: number;
}

interface Props {
  onConfirmar: (ubicacion: UbicacionConfirmada) => void;
  onCancelar?: () => void;
  valorInicial?: Partial<UbicacionConfirmada>;
}

// Flujo estilo Mercado Libre:
// 1. Se pide la ubicación aproximada por GPS (con permiso del usuario)
// 2. Se muestra en un mapa con un pin arrastrable
// 3. Al mover el pin se rellena sola la dirección y el código postal
// 4. El usuario confirma o corrige a mano
// 5. Se valida que esté dentro de la zona de reparto antes de aceptar
export default function SelectorUbicacion({
  onConfirmar,
  onCancelar,
  valorInicial,
}: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const marcadorRef = useRef<any>(null);
  const mapaRef = useRef<any>(null);

  const [lat, setLat] = useState(valorInicial?.latitud ?? CENTRO_PACHUCA.lat);
  const [lng, setLng] = useState(valorInicial?.longitud ?? CENTRO_PACHUCA.lng);
  const [direccionTexto, setDireccionTexto] = useState(valorInicial?.direccionTexto ?? '');
  const [codigoPostal, setCodigoPostal] = useState(valorInicial?.codigoPostal ?? '');
  const [referencias, setReferencias] = useState(valorInicial?.referencias ?? '');

  const [buscandoGps, setBuscandoGps] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [avisoGps, setAvisoGps] = useState('');
  const [error, setError] = useState('');

  // Pide la dirección y el CP al servidor a partir de unas coordenadas
  const rellenarDesdeCoordenadas = useCallback(async (nLat: number, nLng: number) => {
    setBuscandoDireccion(true);
    try {
      const r = await fetch(`/api/geocodificar?lat=${nLat}&lng=${nLng}`);
      const datos = await r.json();
      if (datos.direccion) setDireccionTexto(datos.direccion);
      if (datos.codigoPostal) setCodigoPostal(datos.codigoPostal);
    } catch {
      // Silencioso: el usuario siempre puede escribir la dirección a mano
    } finally {
      setBuscandoDireccion(false);
    }
  }, []);

  // Monta el mapa una sola vez
  useEffect(() => {
    let cancelado = false;

    async function inicializar() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css' as any);
      if (cancelado || !contenedorRef.current || mapaRef.current) return;

      // Los íconos por defecto de Leaflet no cargan bien con bundlers;
      // se apuntan explícitamente al CDN
      const icono = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const mapa = L.map(contenedorRef.current).setView([lat, lng], 16);
      mapaRef.current = mapa;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapa);

      const marcador = L.marker([lat, lng], { draggable: true, icon: icono }).addTo(mapa);
      marcadorRef.current = marcador;

      function actualizar(nLat: number, nLng: number) {
        setLat(nLat);
        setLng(nLng);
        setError('');
        rellenarDesdeCoordenadas(nLat, nLng);
      }

      marcador.on('dragend', () => {
        const p = marcador.getLatLng();
        actualizar(p.lat, p.lng);
      });

      mapa.on('click', (e: any) => {
        marcador.setLatLng(e.latlng);
        actualizar(e.latlng.lat, e.latlng.lng);
      });
    }

    inicializar();

    return () => {
      cancelado = true;
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
      }
    };
    // Se monta una sola vez a propósito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Botón "usar mi ubicación actual"
  function usarGps() {
    if (!navigator.geolocation) {
      setAvisoGps('Tu navegador no permite obtener la ubicación. Muévela a mano en el mapa.');
      return;
    }

    setBuscandoGps(true);
    setAvisoGps('');

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const nLat = posicion.coords.latitude;
        const nLng = posicion.coords.longitude;

        setLat(nLat);
        setLng(nLng);
        setBuscandoGps(false);

        if (mapaRef.current && marcadorRef.current) {
          mapaRef.current.setView([nLat, nLng], 17);
          marcadorRef.current.setLatLng([nLat, nLng]);
        }
        rellenarDesdeCoordenadas(nLat, nLng);
      },
      () => {
        setBuscandoGps(false);
        setAvisoGps(
          'No pudimos obtener tu ubicación. Revisa los permisos del navegador o mueve el pin a mano.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function confirmar() {
    if (!direccionTexto.trim()) {
      setError('Escribe la calle y número de la entrega.');
      return;
    }

    const cobertura = verificarCobertura(lat, lng, codigoPostal);
    if (!cobertura.dentroDeCobertura) {
      setError(cobertura.motivo);
      return;
    }

    onConfirmar({
      direccionTexto: direccionTexto.trim(),
      codigoPostal: codigoPostal.trim(),
      referencias: referencias.trim(),
      latitud: lat,
      longitud: lng,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ave-oscuro">
            Confirma dónde quieres recibir tu pedido
          </p>
          <button
            type="button"
            onClick={usarGps}
            disabled={buscandoGps}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-ave-oscuro transition hover:border-ave-rojo hover:text-ave-rojo disabled:opacity-50"
          >
            {buscandoGps ? 'Buscando...' : '📍 Usar mi ubicación actual'}
          </button>
        </div>

        <div
          ref={contenedorRef}
          className="h-72 w-full overflow-hidden rounded-xl border border-slate-200"
        />

        <p className="mt-2 text-xs text-ave-oscuro/60">
          Arrastra el pin o toca el mapa para ajustar la ubicación exacta.
        </p>
        {avisoGps && <p className="mt-1 text-xs text-amber-600">{avisoGps}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ave-oscuro">
            Calle y número
          </label>
          <input
            value={direccionTexto}
            onChange={(e) => setDireccionTexto(e.target.value)}
            placeholder={buscandoDireccion ? 'Obteniendo dirección...' : 'Calle, número, colonia'}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ave-oscuro">
            Código postal
          </label>
          <input
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            inputMode="numeric"
            maxLength={5}
            placeholder="42000"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ave-oscuro">
          Referencias (opcional)
        </label>
        <input
          value={referencias}
          onChange={(e) => setReferencias(e.target.value)}
          placeholder="Portón negro, casa azul, entre qué calles"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ave-rojo"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-ave-rojo">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={confirmar}
          className="flex-1 rounded-lg bg-ave-rojo px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Confirmar ubicación
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-ave-oscuro"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
