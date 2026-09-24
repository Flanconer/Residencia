'use client';

import { useRef, useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import type { Categoria, ProductoConCategoria } from '@/types';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { colorVisible, iconoDe, tinte } from '@/lib/utils/categorias';
import CampoFormulario from '@/components/CampoFormulario';

const TAMANO_MAXIMO_MB = 5;

export default function EditorProductos({
  productosIniciales,
  categorias,
}: {
  productosIniciales: ProductoConCategoria[];
  categorias: Categoria[];
}) {
  const [productos, setProductos] = useState(productosIniciales);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [creando, setCreando] = useState(false);

  function avisar(ok: boolean, texto: string) {
    setMensaje({ ok, texto });
    setTimeout(() => setMensaje(null), 3000);
  }

  async function guardar(id: number, cambios: Record<string, unknown>) {
    const r = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    });
    const datos = await r.json();
    if (!r.ok) {
      avisar(false, datos.error ?? 'No se pudo guardar el cambio.');
      return false;
    }
    setProductos((prev) => prev.map((p) => (p.id === id ? datos : p)));
    avisar(true, 'Cambio guardado.');
    return true;
  }

  return (
    <div className="space-y-10">
      {mensaje && (
        <p
          role="status"
          className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${
            mensaje.ok ? 'bg-ave-oscuro text-white' : 'bg-ave-rojo text-white'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {creando ? (
        <FormularioNuevo
          categorias={categorias}
          onCancelar={() => setCreando(false)}
          onCreado={(nuevo) => {
            setProductos((prev) => [...prev, nuevo]);
            setCreando(false);
            avisar(true, 'Producto agregado.');
          }}
        />
      ) : (
        <button
          onClick={() => setCreando(true)}
          className="flex items-center gap-2 rounded-xl bg-ave-rojo px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Plus size={18} />
          Agregar producto
        </button>
      )}

      {categorias.map((categoria) => {
        const deCategoria = productos.filter((p) => p.categoria_id === categoria.id);
        if (deCategoria.length === 0) return null;

        return (
          <section key={categoria.id}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full ring-1 ring-slate-300"
                style={{ backgroundColor: categoria.color_hex }}
              />
              <h2 className="font-display text-xl font-bold text-ave-oscuro">
                {categoria.nombre}
              </h2>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {deCategoria.map((producto) => (
                <FilaProducto
                  key={producto.id}
                  producto={producto}
                  onGuardar={guardar}
                  onError={(t) => avisar(false, t)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FilaProducto({
  producto,
  onGuardar,
  onError,
}: {
  producto: ProductoConCategoria;
  onGuardar: (id: number, cambios: Record<string, unknown>) => Promise<boolean>;
  onError: (texto: string) => void;
}) {
  const inputFoto = useRef<HTMLInputElement>(null);
  const [precio, setPrecio] = useState(String(producto.precio));
  const [subiendo, setSubiendo] = useState(false);

  const color = colorVisible(producto.categoria?.color_hex);
  const Icono = iconoDe(producto.categoria?.slug);
  const precioCambiado = Number(precio) !== Number(producto.precio);

  async function subirFoto(archivo: File) {
    if (!archivo.type.startsWith('image/')) {
      onError('El archivo tiene que ser una imagen (JPG, PNG o WEBP).');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      onError(`La foto pesa más de ${TAMANO_MAXIMO_MB} MB. Usa una más ligera.`);
      return;
    }

    setSubiendo(true);
    const supabase = crearClienteSupabase();
    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    // Nombre único: evita que el navegador muestre una foto vieja en caché
    const ruta = `producto-${producto.id}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from('productos').upload(ruta, archivo, {
      cacheControl: '31536000',
    });

    if (error) {
      setSubiendo(false);
      onError('No se pudo subir la foto. Revisa que corriste la migración 006.');
      return;
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(ruta);
    await onGuardar(producto.id, { imagen_url: data.publicUrl });
    setSubiendo(false);
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-4 p-4 ${producto.disponible ? '' : 'bg-slate-50'}`}
    >
      <button
        type="button"
        onClick={() => inputFoto.current?.click()}
        disabled={subiendo}
        title="Cambiar foto"
        className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: tinte(color, 0.22) }}
      >
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icono size={26} strokeWidth={1.5} style={{ color }} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ave-oscuro/60 text-white opacity-0 transition group-hover:opacity-100">
          {subiendo ? '...' : <Camera size={20} />}
        </span>
      </button>
      <input
        ref={inputFoto}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) subirFoto(archivo);
          e.target.value = '';
        }}
      />

      <div className="min-w-[10rem] flex-1">
        <p className="font-semibold text-ave-oscuro">{producto.nombre}</p>
        <p className="text-xs text-ave-oscuro/50">
          {producto.descripcion ?? 'Sin descripción'} · {producto.unidad}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3">
          <span className="text-sm text-ave-oscuro/50">$</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            aria-label={`Precio de ${producto.nombre}`}
            className="w-20 bg-transparent py-2 pl-1 text-right text-sm font-semibold outline-none"
          />
        </div>
        {precioCambiado && (
          <button
            onClick={() => onGuardar(producto.id, { precio: Number(precio) })}
            className="rounded-xl bg-ave-oscuro px-3 py-2 text-xs font-semibold text-white"
          >
            Guardar
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Interruptor
          etiqueta="Disponible"
          activo={producto.disponible}
          onCambiar={(v) => onGuardar(producto.id, { disponible: v })}
        />
        <Interruptor
          etiqueta="Destacado"
          activo={producto.destacado}
          onCambiar={(v) => onGuardar(producto.id, { destacado: v })}
        />
      </div>
    </div>
  );
}

function Interruptor({
  etiqueta,
  activo,
  onCambiar,
}: {
  etiqueta: string;
  activo: boolean;
  onCambiar: (valor: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambiar(!activo)}
      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
        activo
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-ave-oscuro/50 hover:bg-slate-200'
      }`}
    >
      {activo ? '✓ ' : ''}
      {etiqueta}
    </button>
  );
}

function FormularioNuevo({
  categorias,
  onCancelar,
  onCreado,
}: {
  categorias: Categoria[];
  onCancelar: () => void;
  onCreado: (producto: ProductoConCategoria) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState(String(categorias[0]?.id ?? ''));
  const [precio, setPrecio] = useState('');
  const [unidad, setUnidad] = useState('500 g');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setGuardando(true);

    const r = await fetch('/api/admin/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        categoria_id: Number(categoriaId),
        precio: Number(precio),
        unidad: unidad.trim(),
        descripcion: descripcion.trim() || null,
        disponible: true,
      }),
    });

    const datos = await r.json();
    setGuardando(false);

    if (!r.ok) {
      setError(datos.error ?? 'No se pudo crear el producto.');
      return;
    }
    onCreado(datos);
  }

  return (
    <form onSubmit={crear} className="rounded-2xl bg-ave-cielo-claro p-6">
      <h2 className="font-display text-xl font-bold text-ave-oscuro">Nuevo producto</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          etiqueta="Nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ave-oscuro">Categoría</span>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ave-oscuro outline-none focus:border-ave-oscuro"
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <CampoFormulario
          etiqueta="Precio"
          type="number"
          min={0}
          step="0.5"
          required
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
        <CampoFormulario
          etiqueta="Unidad de venta"
          required
          ayuda='Ejemplos: "kg", "500 g", "12 piezas"'
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
        />
        <div className="sm:col-span-2">
          <CampoFormulario
            etiqueta="Descripción (opcional)"
            placeholder="4 piezas | Rellenas de queso"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-ave-rojo">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          disabled={guardando}
          className="rounded-xl bg-ave-rojo px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Agregar producto'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl px-5 py-3 text-sm font-semibold text-ave-oscuro/60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
