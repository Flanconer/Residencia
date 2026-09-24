// Campo de texto con etiqueta, consistente en todos los formularios
export default function CampoFormulario({
  etiqueta,
  ayuda,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { etiqueta: string; ayuda?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ave-oscuro">{etiqueta}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ave-oscuro outline-none transition placeholder:text-ave-oscuro/30 focus:border-ave-oscuro focus:ring-4 focus:ring-ave-cielo/40"
      />
      {ayuda && <span className="mt-1.5 block text-xs text-ave-oscuro/50">{ayuda}</span>}
    </label>
  );
}
