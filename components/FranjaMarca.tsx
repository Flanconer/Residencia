import { FRANJA_MARCA } from '@/lib/utils/categorias';

// La banda de colores de categoría: el sello visual de la marca, igual
// que en los empaques. Se usa bajo el hero, en el footer y en el login.
export default function FranjaMarca({ alto = 'h-2' }: { alto?: string }) {
  return (
    <div className={`flex w-full ${alto}`} aria-hidden>
      {FRANJA_MARCA.map((color) => (
        <span
          key={color}
          className="flex-1"
          style={{
            backgroundColor: color,
            // El blanco se pierde sobre fondos claros; se le da un borde
            boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #D6EAF4' : undefined,
          }}
        />
      ))}
    </div>
  );
}
