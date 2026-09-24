import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { crearClienteSupabaseServicio } from '@/lib/supabase/admin';
import { rangoDelDia } from '@/lib/utils/formatoFecha';
import type { ItemCarrito, MetodoPago, PedidoConDetalle } from '@/types';

interface DatosNuevoPedido {
  usuarioId: string;
  items: ItemCarrito[];
  metodoPago: MetodoPago;
  direccionTexto: string;
  codigoPostal?: string;
  latitud: number | null;
  longitud: number | null;
  referencias?: string;
  notas?: string;
}

// Crea un pedido junto con sus items, calculando el total en el servidor
// (nunca confiar en el total que mande el cliente).
//
// Usa el cliente de servicio porque los invitados no tienen sesión y las
// políticas RLS no les dejarían guardar su pedido. Es seguro porque solo
// se llama desde /api/pedidos, DESPUÉS de validar datos, precios reales
// y cobertura en el servidor.
export async function crearPedido(datos: DatosNuevoPedido) {
  const supabase = crearClienteSupabaseServicio();

  // Esto es un ESTIMADO, no el cobro final: los productos se venden por
  // peso y el precio real se conoce hasta que la planta pesa el pedido.
  const totalEstimado = datos.items.reduce(
    (suma, item) => suma + item.producto.precio * item.cantidad,
    0
  );

  const { data: pedido, error: errorPedido } = await supabase
    .from('pedidos')
    .insert({
      usuario_id: datos.usuarioId,
      metodo_pago: datos.metodoPago,
      total_estimado: totalEstimado,
      direccion_texto: datos.direccionTexto,
      codigo_postal: datos.codigoPostal ?? null,
      latitud: datos.latitud,
      longitud: datos.longitud,
      referencias: datos.referencias ?? null,
      notas: datos.notas ?? null,
    })
    .select()
    .single();

  if (errorPedido) throw errorPedido;

  const items = datos.items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.producto.id,
    cantidad: item.cantidad,
    precio_unitario: item.producto.precio,
    subtotal: item.producto.precio * item.cantidad,
    preparacion: item.preparacion ?? null,
    nota: item.nota ?? null,
  }));

  const { error: errorItems } = await supabase.from('pedido_items').insert(items);
  if (errorItems) throw errorItems;

  return pedido;
}

// Obtiene los pedidos de un día específico, con cliente e items incluidos
// Esta es la función clave del panel de administración
export async function obtenerPedidosPorDia(
  fecha: string // formato 'YYYY-MM-DD'
): Promise<PedidoConDetalle[]> {
  const supabase = crearClienteSupabaseServidor();

  // El rango se calcula en hora de Pachuca, no en UTC
  const { inicio: inicioDelDia, fin: finDelDia } = rangoDelDia(fecha);

  const { data, error } = await supabase
    .from('pedidos')
    .select(
      `*,
      usuario:usuarios(*),
      items:pedido_items(*, producto:productos(*))`
    )
    .gte('creado_en', inicioDelDia)
    .lte('creado_en', finDelDia)
    .order('creado_en', { ascending: true });

  if (error) throw error;
  return data as unknown as PedidoConDetalle[];
}

// Obtiene un solo pedido con todo su detalle (para la vista de impresión individual)
export async function obtenerPedidoPorId(id: number): Promise<PedidoConDetalle | null> {
  const supabase = crearClienteSupabaseServidor();

  const { data, error } = await supabase
    .from('pedidos')
    .select(
      `*,
      usuario:usuarios(*),
      items:pedido_items(*, producto:productos(*))`
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as PedidoConDetalle;
}

// Actualiza el estado de un pedido (usado desde el panel admin)
export async function actualizarEstadoPedido(id: number, estado: string) {
  const supabase = crearClienteSupabaseServidor();

  const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id);
  if (error) throw error;
}

// Historial de pedidos del usuario con sesión iniciada.
// Las políticas RLS garantizan que nadie vea los pedidos de otra persona.
export async function obtenerMisPedidos(): Promise<PedidoConDetalle[]> {
  const { obtenerUsuarioActual } = await import('./usuarios');
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return [];

  const supabase = crearClienteSupabaseServidor();
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      `*,
      usuario:usuarios(*),
      items:pedido_items(*, producto:productos(*))`
    )
    .eq('usuario_id', usuario.id)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return data as unknown as PedidoConDetalle[];
}

export interface PesoCapturado {
  itemId: number;
  cantidadReal: number;
}

// Registra los pesos reales que la planta anotó en la hoja impresa y
// calcula el total final del pedido.
//
// El precio unitario NO se vuelve a consultar: se usa el que quedó
// congelado en el pedido. Si el precio de lista cambió entre el pedido
// y la entrega, al cliente se le respeta el precio del día que pidió.
export async function registrarPesos(pedidoId: number, pesos: PesoCapturado[]) {
  const supabase = crearClienteSupabaseServidor();

  const { data: items, error: errorItems } = await supabase
    .from('pedido_items')
    .select('id, precio_unitario')
    .eq('pedido_id', pedidoId);

  if (errorItems) throw errorItems;
  if (!items?.length) throw new Error('El pedido no tiene productos');

  const preciosPorItem = new Map(items.map((i) => [i.id, Number(i.precio_unitario)]));

  let totalFinal = 0;

  for (const peso of pesos) {
    const precioUnitario = preciosPorItem.get(peso.itemId);
    if (precioUnitario === undefined) continue;

    const subtotalReal = precioUnitario * peso.cantidadReal;
    totalFinal += subtotalReal;

    const { error } = await supabase
      .from('pedido_items')
      .update({
        cantidad_real: peso.cantidadReal,
        subtotal_real: subtotalReal,
      })
      .eq('id', peso.itemId)
      .eq('pedido_id', pedidoId);

    if (error) throw error;
  }

  const { error: errorPedido } = await supabase
    .from('pedidos')
    .update({
      total_final: totalFinal,
      pesado_en: new Date().toISOString(),
      estado: 'pesado',
    })
    .eq('id', pedidoId);

  if (errorPedido) throw errorPedido;

  return totalFinal;
}

// Marca que ya se le avisó al cliente su total final
export async function marcarNotificado(pedidoId: number) {
  const supabase = crearClienteSupabaseServidor();
  const { error } = await supabase
    .from('pedidos')
    .update({ notificado_en: new Date().toISOString() })
    .eq('id', pedidoId);
  if (error) throw error;
}

// Registra cómo y cuándo pagó el cliente (o lo desmarca si fue un error)
export async function registrarPago(
  pedidoId: number,
  metodo: 'efectivo' | 'transferencia' | null
) {
  const supabase = crearClienteSupabaseServidor();
  const { error } = await supabase
    .from('pedidos')
    .update({
      pagado: metodo !== null,
      metodo_cobro: metodo,
      pagado_en: metodo ? new Date().toISOString() : null,
    })
    .eq('id', pedidoId);
  if (error) throw error;
}
