import { UserRound } from 'lucide-react';
import { obtenerUsuarioActual } from '@/lib/models/usuarios';

// Server Component: muestra "Entrar" o el nombre, según haya sesión
export default async function MenuCuenta() {
  const usuario = await obtenerUsuarioActual();

  const destino = !usuario ? '/login' : usuario.rol === 'admin' ? '/admin' : '/mi-cuenta';
  const texto = !usuario
    ? 'Entrar'
    : usuario.rol === 'admin'
      ? 'Panel'
      : usuario.nombre.split(' ')[0];

  return (
    <a
      href={destino}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-ave-cielo-claro"
    >
      <UserRound size={20} strokeWidth={1.75} />
      <span className="hidden sm:inline">{texto}</span>
    </a>
  );
}
