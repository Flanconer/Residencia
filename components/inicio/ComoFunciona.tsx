import { ClipboardList, Scale, Truck } from 'lucide-react';

// Es una secuencia real (pedir -> pesar -> entregar), por eso va numerada.
// El paso 2 explica de entrada por qué el precio final se conoce al pesar.
const PASOS = [
  {
    Icono: ClipboardList,
    titulo: 'Haces tu pedido',
    texto:
      'Elige tus productos y cómo quieres tu pollo: natural, sin piel o deshuesado.',
  },
  {
    Icono: Scale,
    titulo: 'Lo preparamos y pesamos',
    texto:
      'Como vendemos por peso, al pesar sale tu total exacto. Te lo mandamos por WhatsApp.',
  },
  {
    Icono: Truck,
    titulo: 'Te lo llevamos',
    texto: 'Recibes tu pedido en casa y pagas en efectivo o por transferencia.',
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="a-sangre scroll-mt-24 bg-ave-cielo-claro">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-ave-oscuro">Cómo funciona</h2>

        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {PASOS.map(({ Icono, titulo, texto }, i) => (
            <li key={titulo} className="flex gap-4">
              <span className="font-display text-5xl font-extrabold leading-none text-ave-cielo">
                {i + 1}
              </span>
              <div>
                <Icono size={24} strokeWidth={1.75} className="mb-2 text-ave-rojo" />
                <h3 className="font-display text-xl font-bold text-ave-oscuro">
                  {titulo}
                </h3>
                <p className="mt-1.5 leading-relaxed text-ave-oscuro/70">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
