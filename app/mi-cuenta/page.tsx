import { redirect } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/models/usuarios';
import { obtenerMisDirecciones } from '@/lib/models/direcciones';
import { obtenerMisPedidos } from '@/lib/models/pedidos';
import { formatearMoneda } from '@/lib/utils/calcularTotal';
import { formatearFechaHora } from '@/lib/utils/formatoFecha';
import BotonCerrarSesion from '@/components/BotonCerrarSesion';
import ListaDirecciones from '@/components/ListaDirecciones';
import FranjaMarca from '@/components/FranjaMarca';
import SeguimientoPedido from '@/components/cuenta/SeguimientoPedido';
import BotonVolverAPedir from '@/components/cuenta/BotonVolverAPedir';
import FormularioPerfil from '@/components/cuenta/FormularioPerfil';
import { infoUnidad } from '@/lib/utils/unidades';

export default async function PaginaMiCuenta() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect('/login');
  if (usuario.rol === 'admin') redirect('/admin');

  const [direcciones, pedidos] = await Promise.all([
    obtenerMisDirecciones(),
    obtenerMisPedidos(),
  ]);

  const enCurso = pedidos.filter(
    (p) => !['entregado', 'cancelado'].includes(p.estado)
  ).length;

  return (
    <div>
      {/* Encabezado de la cuenta */}
      <section className="a-sangre -mt-8 bg-ave-cielo">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-ave-oscuro">
              Hola, {usuario.nombre.split(' ')[0]}
            </h1>
            <p className="mt-2 text-ave-oscuro/70">
              {enCurso > 0
                ? `Tienes ${enCurso} ${enCurso === 1 ? 'pedido en curso' : 'pedidos en curso'}.`
                : 'No tienes pedidos en curso.'}
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <a href="#pedidos" className="rounded-xl bg-white/70 px-4 py-2 transition hover:bg-white">
              Pedidos
            </a>
            <a
              href="#direcciones"
              className="rounded-xl bg-white/70 px-4 py-2 transition hover:bg-white"
            >
              Direcciones
            </a>
            <a href="#datos" className="rounded-xl bg-white/70 px-4 py-2 transition hover:bg-white">
              Mis datos
            </a>
          </nav>
        </div>
        <FranjaMarca alto="h-2" />
      </section>

      {/* Pedidos */}
      <section id="pedidos" className="scroll-mt-28 py-12">
        <h2 className="font-display text-2xl font-bold text-ave-oscuro">Mis pedidos</h2>

        {pedidos.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-ave-cielo-claro p-8">
            <p className="font-display text-xl font-bold text-ave-oscuro">
              Todavía no has hecho pedidos.
            </p>
            <a
              href="/catalogo"
              className="mt-4 inline-block rounded-xl bg-ave-rojo px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Hacer mi primer pedido
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-2xl border border-slate-200 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold text-ave-oscuro">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-sm text-ave-oscuro/50">
                      {formatearFechaHora(pedido.creado_en)}
                    </p>
                  </div>

                  <div className="text-right">
                    {pedido.total_final != null ? (
                      <>
                        <p className="text-xs text-ave-oscuro/50">Total final</p>
                        <p className="font-display text-xl font-bold text-ave-oscuro">
                          {formatearMoneda(pedido.total_final)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-ave-oscuro/50">Estimado, falta pesar</p>
                        <p className="font-display text-xl font-bold text-ave-oscuro/60">
                          {formatearMoneda(pedido.total_estimado)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 max-w-md">
                  <SeguimientoPedido estado={pedido.estado} />
                </div>

                <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  {pedido.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span className="text-ave-oscuro/80">
                        {item.producto?.nombre}
                        {item.preparacion && (
                          <span className="text-ave-oscuro/50"> · {item.preparacion}</span>
                        )}
                        {item.nota && (
                          <span className="block text-xs italic text-ave-oscuro/50">
                            &ldquo;{item.nota}&rdquo;
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-ave-oscuro/60">
                        {item.cantidad_real != null
                          ? `${item.cantidad_real} ${item.producto?.unidad} (peso real)`
                          : infoUnidad(item.producto?.unidad ?? '').formatear(Number(item.cantidad))}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-ave-oscuro/50">{pedido.direccion_texto}</p>
                  <BotonVolverAPedir pedido={pedido} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Direcciones */}
      <section id="direcciones" className="scroll-mt-28 border-t border-slate-100 py-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-ave-oscuro">
          Mis direcciones
        </h2>
        <ListaDirecciones direccionesIniciales={direcciones} />
      </section>

      {/* Datos */}
      <section id="datos" className="scroll-mt-28 border-t border-slate-100 py-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <h2 className="mb-6 font-display text-2xl font-bold text-ave-oscuro">
              Mis datos
            </h2>
            <FormularioPerfil
              nombreInicial={usuario.nombre}
              telefonoInicial={usuario.telefono ?? ''}
              email={usuario.email ?? ''}
            />
          </div>
          <BotonCerrarSesion />
        </div>
      </section>
    </div>
  );
}
