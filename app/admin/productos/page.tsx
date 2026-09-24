import { obtenerCategorias, obtenerTodosLosProductos } from '@/lib/models/productos';
import EditorProductos from '@/components/admin/EditorProductos';

export default async function PaginaAdminProductos() {
  const [productos, categorias] = await Promise.all([
    obtenerTodosLosProductos(),
    obtenerCategorias(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ave-oscuro">Productos</h1>
      <p className="mt-1 text-ave-oscuro/60">
        Cambia precios, marca productos agotados, elige los destacados de la página
        principal y sube sus fotos.
      </p>
      <div className="mt-8">
        <EditorProductos productosIniciales={productos as any} categorias={categorias} />
      </div>
    </div>
  );
}
