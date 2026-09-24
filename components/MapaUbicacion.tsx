'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onCambiarUbicacion: (lat: number, lng: number) => void;
  latInicial?: number;
  lngInicial?: number;
}

// Selector de ubicación con mapa interactivo: el cliente arrastra el pin
// a la dirección exacta de entrega, igual que en Mercado Libre.
// Usa Leaflet + OpenStreetMap (gratis, sin necesidad de API key).
export default function MapaUbicacion({
  onCambiarUbicacion,
  latInicial = 20.121,
  lngInicial = -98.7346, // Pachuca de Soto, Hidalgo, como centro por defecto
}: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let mapa: any;
    let marcador: any;

    async function inicializarMapa() {
      // Leaflet se carga dinámicamente porque depende de `window`
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css' as any);

      if (!contenedorRef.current) return;

      mapa = L.map(contenedorRef.current).setView([latInicial, lngInicial], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapa);

      marcador = L.marker([latInicial, lngInicial], { draggable: true }).addTo(mapa);

      marcador.on('dragend', () => {
        const { lat, lng } = marcador.getLatLng();
        onCambiarUbicacion(lat, lng);
      });

      mapa.on('click', (e: any) => {
        marcador.setLatLng(e.latlng);
        onCambiarUbicacion(e.latlng.lat, e.latlng.lng);
      });

      onCambiarUbicacion(latInicial, lngInicial);
      setCargando(false);
    }

    inicializarMapa();

    return () => {
      if (mapa) mapa.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {cargando && <p className="mb-2 text-sm text-gray-500">Cargando mapa...</p>}
      <div ref={contenedorRef} className="h-72 w-full rounded-lg border border-gray-300" />
      <p className="mt-2 text-sm text-gray-500">
        Arrastra el pin o toca el mapa para marcar la ubicación exacta de entrega.
      </p>
    </div>
  );
}
