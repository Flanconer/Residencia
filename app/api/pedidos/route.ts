import { NextRequest, NextResponse } from 'next/server';
import { crearPedido, obtenerPedidosPorDia } from '@/lib/models/pedidos';
import { esAdministrador, obtenerOCrearUsuario } from '@/lib/models/usuarios';
import { obtenerProductoPorId } from '@/lib/models/productos';
import { fechaHoy } from '@/lib/utils/formatoFecha';
import { verificarCobertura } from '@/lib/utils/cobertura';
import { infoUnidad } from '@/lib/utils/unidades';
import {
  LARGO_MAXIMO_NOTA,
  admiteNotas,
  preparacionesDe,
} from '@/lib/utils/preparaciones';
import { NEGOCIO } from '@/lib/config/negocio';

// Tope por producto: evita errores de captura como "150 kg" por "1.5 kg"
const CANTIDAD_MAXIMA = 100;
import type { ItemCarrito } from '@/types';

// POST /api/pedidos -> crea un nuevo pedido desde el checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cliente,
      items,
      metodoPago,
      direccionTexto,
      codigoPostal,
      latitud,
      longitud,
      referencias,
      notas,
    } = body;

    if (!cliente?.nombre || !cliente?.telefono || !items?.length || !direccionTexto) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (latitud == null || longitud == null) {
      return NextResponse.json(
        { error: 'Falta la ubicación de entrega' },
        { status: 400 }
      );
    }

    // La cobertura se revalida SIEMPRE en el servidor. La comprobación
    // del navegador solo sirve para avisar rápido al cliente; alguien
    // podría saltársela llamando a esta ruta directamente.
    const cobertura = verificarCobertura(latitud, longitud, codigoPostal);
    if (!cobertura.dentroDeCobertura) {
      return NextResponse.json({ error: cobertura.motivo }, { status: 400 });
    }

    const usuario = await obtenerOCrearUsuario(cliente);

    // Se vuelve a consultar cada producto en el servidor para tomar el precio real,
    // nunca el que venga del cliente (evita manipulación de precios).
    const itemsCarrito: ItemCarrito[] = [];
    for (const item of items) {
      const producto = await obtenerProductoPorId(item.productoId);
      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.productoId} no encontrado` },
          { status: 400 }
        );
      }

      if (!producto.disponible) {
        return NextResponse.json(
          { error: `${producto.nombre} ya no está disponible. Quítalo del carrito.` },
          { status: 400 }
        );
      }

      // La cantidad se valida contra la unidad real del producto: kilos de
      // medio en medio, paquetes enteros. Nunca cero ni negativa, que
      // bajaría el total.
      const unidad = infoUnidad(producto.unidad);
      const cantidad = Number(item.cantidad);
      const multiploValido = Math.abs(cantidad / unidad.paso - Math.round(cantidad / unidad.paso)) < 1e-9;

      if (
        !Number.isFinite(cantidad) ||
        cantidad < unidad.minimo ||
        cantidad > CANTIDAD_MAXIMA ||
        !multiploValido
      ) {
        return NextResponse.json(
          { error: `La cantidad de ${producto.nombre} no es válida.` },
          { status: 400 }
        );
      }

      // La preparación tiene que ser una de las permitidas para ese producto
      const opciones = preparacionesDe(producto.categoria?.slug, producto.nombre);
      if (item.preparacion && !opciones?.includes(item.preparacion)) {
        return NextResponse.json(
          { error: `La preparación de ${producto.nombre} no es válida.` },
          { status: 400 }
        );
      }

      // Notas: solo en las categorías que las admiten, y con largo máximo
      const nota = typeof item.nota === 'string' ? item.nota.trim() : '';
      if (nota && !admiteNotas(producto.categoria?.slug)) {
        return NextResponse.json(
          { error: `${producto.nombre} no admite notas.` },
          { status: 400 }
        );
      }
      if (nota.length > LARGO_MAXIMO_NOTA) {
        return NextResponse.json(
          { error: `La nota de ${producto.nombre} es demasiado larga.` },
          { status: 400 }
        );
      }

      itemsCarrito.push({
        producto,
        cantidad,
        nota: nota || null,
        // Si el producto admite preparación y no llegó ninguna, va "Natural"
        preparacion: item.preparacion ?? opciones?.[0] ?? null,
      });
    }

    // Pedido mínimo para entrega a domicilio (si está configurado).
    // Se compara el aproximado, calculado con los precios de la base de
    // datos, nunca con un total que mande el navegador.
    if (NEGOCIO.pedidoMinimo > 0) {
      const aproximado = itemsCarrito.reduce(
        (suma, i) => suma + Number(i.producto.precio) * i.cantidad,
        0
      );
      if (aproximado < NEGOCIO.pedidoMinimo) {
        return NextResponse.json(
          {
            error: `El pedido mínimo para entrega a domicilio es de $${NEGOCIO.pedidoMinimo}.`,
          },
          { status: 400 }
        );
      }
    }

    const pedido = await crearPedido({
      usuarioId: usuario.id,
      items: itemsCarrito,
      metodoPago,
      direccionTexto,
      codigoPostal,
      latitud,
      longitud,
      referencias,
      notas,
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
  }
}

// GET /api/pedidos?fecha=YYYY-MM-DD -> lista de pedidos de un día (panel admin).
// Solo para administradores: antes cualquiera podía consultar los pedidos
// del día, con los datos y direcciones de todos los clientes.
export async function GET(request: NextRequest) {
  if (!(await esAdministrador())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const fecha = request.nextUrl.searchParams.get('fecha') ?? fechaHoy();
  const pedidos = await obtenerPedidosPorDia(fecha);
  return NextResponse.json(pedidos);
}
