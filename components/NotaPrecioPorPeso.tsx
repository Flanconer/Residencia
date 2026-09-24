import { Scale } from 'lucide-react';

// Explica por qué el total es aproximado. Aparece en el detalle del
// producto, el carrito y el checkout, con el mismo mensaje en todos lados.
export default function NotaPrecioPorPeso({
  variante = 'completa',
}: {
  variante?: 'completa' | 'breve';
}) {
  if (variante === 'breve') {
    return (
      <p className="flex items-center gap-1.5 text-xs text-ave-oscuro/55">
        <Scale size={13} strokeWidth={2} className="shrink-0" />
        El total final depende del peso real
      </p>
    );
  }

  return (
    <div className="flex gap-3 rounded-2xl bg-ave-cielo-claro p-4">
      <Scale size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ave-oscuro" />
      <div className="text-sm">
        <p className="font-semibold text-ave-oscuro">
          Este es un total aproximado, no lo que vas a pagar.
        </p>
        <p className="mt-1 leading-relaxed text-ave-oscuro/70">
          Vendemos por peso: al preparar tu pedido lo pesamos, y de ahí sale el total
          exacto. Te lo mandamos por WhatsApp antes de salir a reparto y lo pagas al
          recibir.
        </p>
      </div>
    </div>
  );
}
