export interface Categoria {
  id: number;
  nombre: string;
  color_hex: string;
  slug: string;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  unidad: string;
  imagen_url: string | null;
  disponible: boolean;
  destacado: boolean;
  creado_en: string;
}

// Producto tal como lo devuelve la API, con su categoría incluida (join)
export interface ProductoConCategoria extends Producto {
  categoria: Categoria | null;
}

export type RolUsuario = 'cliente' | 'admin';

export interface Usuario {
  id: string;
  auth_id: string | null;
  nombre: string;
  telefono: string | null;
  email: string | null;
  rol: RolUsuario;
  creado_en: string;
}

// Dirección guardada en la libreta del cliente
export interface Direccion {
  id: number;
  usuario_id: string;
  etiqueta: string | null;
  direccion_texto: string;
  codigo_postal: string | null;
  latitud: number | null;
  longitud: number | null;
  referencias: string | null;
  es_predeterminada: boolean;
  creado_en: string;
}

// Flujo real de trabajo:
// pendiente -> en_preparacion -> pesado -> en_reparto -> entregado
export type EstadoPedido =
  | 'pendiente'
  | 'en_preparacion'
  | 'pesado'
  | 'en_reparto'
  | 'entregado'
  | 'cancelado';

export type MetodoPago = 'en_linea' | 'contra_entrega';

// Cómo pagó realmente el cliente (lo registra la secretaria)
export type MetodoCobro = 'efectivo' | 'transferencia';

export interface Pedido {
  id: number;
  usuario_id: string;
  estado: EstadoPedido;
  metodo_pago: MetodoPago;
  pagado: boolean;
  // Lo calculado al hacer el pedido, a partir de los precios de lista
  total_estimado: number;
  // Lo que realmente se cobra, capturado tras pesar. NULL si aún no se pesa.
  total_final: number | null;
  pesado_en: string | null;
  notificado_en: string | null;
  metodo_cobro: MetodoCobro | null;
  pagado_en: string | null;
  direccion_texto: string;
  codigo_postal: string | null;
  latitud: number | null;
  longitud: number | null;
  referencias: string | null;
  notas: string | null;
  creado_en: string;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  // Lo que pidió el cliente
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  preparacion: string | null;
  // Indicación del cliente para esta pieza ("partida en cuatro")
  nota: string | null;
  // Lo que salió de la báscula. NULL hasta que se pesa.
  cantidad_real: number | null;
  subtotal_real: number | null;
}

// Item del carrito en el cliente (antes de convertirse en pedido)
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  // Solo aplica al pollo natural: 'Sin piel', 'Deshuesado', etc.
  preparacion?: string | null;
  // Nota del cliente para esta pieza. Solo pollo natural.
  nota?: string | null;
}

// Pedido con su información relacionada, tal como se usa en el panel admin
export interface PedidoConDetalle extends Pedido {
  usuario: Usuario;
  items: (PedidoItem & { producto: Producto })[];
}
