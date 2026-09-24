'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductoConCategoria } from '@/types';
import { formatearMoneda } from '@/lib/utils/calcularTotal';

// Buscador del encabezado. Muestra sugerencias mientras se escribe y
// lleva a /buscar al enviar. Usa "debounce" de 300 ms para no disparar
// una petición por cada tecla.
export default function BarraBusqueda() {
  const router = useRouter();
  const contenedorRef = useRef<HTMLDivElement>(null);

  const [termino, setTermino] = useState('');
  const [sugerencias, setSugerencias] = useState<ProductoConCategoria[]>([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (termino.trim().length < 2) {
      setSugerencias([]);
      return;
    }

    const temporizador = setTimeout(async () => {
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(termino)}`);
        const datos = await r.json();
        setSugerencias(datos.slice(0, 6));
        setAbierto(true);
      } catch {
        setSugerencias([]);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [termino]);

  // Cierra las sugerencias al hacer clic fuera del buscador
  useEffect(() => {
    function alHacerClic(e: MouseEvent) {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', alHacerClic);
    return () => document.removeEventListener('mousedown', alHacerClic);
  }, []);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!termino.trim()) return;
    setAbierto(false);
    router.push(`/buscar?q=${encodeURIComponent(termino.trim())}`);
  }

  return (
    <div ref={contenedorRef} className="relative w-full">
      <form onSubmit={enviar}>
        <input
          type="search"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={() => sugerencias.length > 0 && setAbierto(true)}
          placeholder="Buscar productos..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-ave-rojo focus:bg-white"
        />
      </form>

      {abierto && sugerencias.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {sugerencias.map((producto) => (
            <a
              key={producto.id}
              href={`/producto/${producto.id}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-slate-50"
            >
              <span className="text-ave-oscuro">{producto.nombre}</span>
              <span className="shrink-0 text-xs font-medium text-ave-rojo">
                {formatearMoneda(producto.precio)}
              </span>
            </a>
          ))}

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setAbierto(false);
              router.push(`/buscar?q=${encodeURIComponent(termino.trim())}`);
            }}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-medium text-ave-oscuro/60 transition hover:bg-slate-50"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
}
