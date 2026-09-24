'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing } from 'lucide-react';

const INTERVALO_MS = 30_000;

// Revisa cada 30 segundos si llegaron pedidos nuevos. Así la secretaria no
// tiene que recargar la página a cada rato para enterarse.
export default function AvisoPedidosNuevos({
  fecha,
  idsIniciales,
}: {
  fecha: string;
  idsIniciales: number[];
}) {
  const router = useRouter();
  const conocidos = useRef(new Set(idsIniciales));
  const [nuevos, setNuevos] = useState(0);

  // Al recargar la lista, los pedidos que ya se muestran dejan de ser "nuevos"
  const firma = idsIniciales.join(',');
  useEffect(() => {
    conocidos.current = new Set(idsIniciales);
    setNuevos(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma]);

  useEffect(() => {
    const tituloOriginal = document.title;

    const revisar = async () => {
      try {
        const r = await fetch(`/api/pedidos?fecha=${fecha}`, { cache: 'no-store' });
        if (!r.ok) return;
        const pedidos: { id: number }[] = await r.json();
        const cuantos = pedidos.filter((p) => !conocidos.current.has(p.id)).length;
        setNuevos(cuantos);
        // El título de la pestaña avisa aunque esté en otra pestaña
        document.title = cuantos > 0 ? `(${cuantos}) Pedido nuevo · Panel` : tituloOriginal;
      } catch {
        // Sin red: se reintenta en el siguiente ciclo
      }
    };

    const temporizador = setInterval(revisar, INTERVALO_MS);
    return () => {
      clearInterval(temporizador);
      document.title = tituloOriginal;
    };
  }, [fecha]);

  if (nuevos === 0) return null;

  return (
    <button
      onClick={() => router.refresh()}
      className="no-imprimir flex w-full items-center justify-center gap-2 rounded-2xl bg-ave-oscuro px-4 py-3 font-semibold text-white transition hover:bg-black"
    >
      <BellRing size={18} className="text-ave-cielo" />
      {nuevos === 1 ? 'Llegó 1 pedido nuevo' : `Llegaron ${nuevos} pedidos nuevos`}. Toca para
      verlos.
    </button>
  );
}
