'use client';

import { usePathname } from 'next/navigation';
import { ClipboardList, Package } from 'lucide-react';

const SECCIONES = [
  { href: '/admin', etiqueta: 'Pedidos', Icono: ClipboardList },
  { href: '/admin/productos', etiqueta: 'Productos', Icono: Package },
];

export default function NavegacionAdmin() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl bg-slate-100 p-1">
      {SECCIONES.map(({ href, etiqueta, Icono }) => {
        const activa =
          href === '/admin'
            ? ruta === '/admin' || ruta.startsWith('/admin/pedidos')
            : ruta.startsWith(href);
        return (
          <a
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activa ? 'bg-white text-ave-oscuro shadow-sm' : 'text-ave-oscuro/60 hover:text-ave-oscuro'
            }`}
          >
            <Icono size={16} />
            {etiqueta}
          </a>
        );
      })}
    </nav>
  );
}
