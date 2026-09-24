import FranjaMarca from '@/components/FranjaMarca';

// Marco compartido por login y registro: a la izquierda la marca (solo en
// pantallas grandes), a la derecha el formulario.
export default function MarcoAcceso({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-ave-cielo p-10 md:flex">
        <div className="inline-flex w-fit rounded-2xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ave-paraiso.png" alt="AVE Paraíso" className="h-14 w-auto" />
        </div>

        <div>
          <p className="font-display text-3xl font-extrabold leading-tight text-ave-oscuro">
            Tus direcciones guardadas y tus pedidos, en un solo lugar.
          </p>
          <ul className="mt-6 space-y-2 text-ave-oscuro/75">
            <li>Pide en segundos con tu dirección de siempre.</li>
            <li>Revisa el peso y el total final de cada pedido.</li>
            <li>Repite tus pedidos frecuentes con un clic.</li>
          </ul>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <FranjaMarca alto="h-2" />
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-6 md:hidden">
          <FranjaMarca alto="h-1.5" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-ave-oscuro">{titulo}</h1>
        <p className="mt-1.5 text-ave-oscuro/60">{subtitulo}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
