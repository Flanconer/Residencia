'use client';

export default function BotonImprimir({ etiqueta = 'Imprimir' }: { etiqueta?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-imprimir rounded-xl bg-ave-oscuro px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
    >
      {etiqueta}
    </button>
  );
}
