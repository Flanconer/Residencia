import { redirect } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/models/usuarios';
import BotonCerrarSesion from '@/components/BotonCerrarSesion';
import NavegacionAdmin from '@/components/admin/NavegacionAdmin';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();

  // Sin sesión, al login. Con sesión pero sin rol de admin, a su cuenta.
  if (!usuario) redirect('/login');
  if (usuario.rol !== 'admin') redirect('/mi-cuenta');

  return (
    <div>
      <div className="no-imprimir mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <NavegacionAdmin />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ave-oscuro/60 sm:inline">{usuario.nombre}</span>
          <BotonCerrarSesion />
        </div>
      </div>
      {children}
    </div>
  );
}
