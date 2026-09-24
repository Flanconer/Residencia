import type { PedidoConDetalle } from '@/types';
import { formatearFechaLegible } from '@/lib/utils/formatoFecha';
import { infoUnidad } from '@/lib/utils/unidades';

interface Props {
  pedidos: PedidoConDetalle[];
  fecha: string;
}

// Oculto en pantalla (ver .hoja-impresion en styles/print.css). Solo aparece
// al imprimir: una hoja limpia para que la secretaria la lleve a la planta.
export default function HojaImpresion({ pedidos, fecha }: Props) {
  return (
    <div className="hoja-impresion">
      <h1>AVE Paraíso — Pedidos del {formatearFechaLegible(fecha)}</h1>
      <p>Total de pedidos: {pedidos.length}</p>
      <p style={{ fontSize: '11px', fontStyle: 'italic' }}>
        Anotar en &quot;Peso real&quot; lo que marque la báscula. La secretaría lo
        captura en el sistema para cerrar la cuenta.
      </p>

      {pedidos.map((pedido) => (
        <div key={pedido.id} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
          <p>
            <strong>Pedido #{pedido.id}</strong> — {pedido.usuario?.nombre} (
            {pedido.usuario?.telefono})
          </p>
          <p>Entrega: {pedido.direccion_texto}</p>
          {pedido.referencias && <p>Referencias: {pedido.referencias}</p>}
          {pedido.notas && <p>Indicaciones de entrega: {pedido.notas}</p>}
          <p>Pago: al recibir</p>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Preparación e indicaciones</th>
                <th>Pedido</th>
                <th style={{ width: '90px' }}>Peso real</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.producto.nombre}</td>
                  <td>
                    <strong>{item.preparacion ?? '—'}</strong>
                    {/* La nota del cliente, destacada: es lo que la planta tiene que leer */}
                    {item.nota && (
                      <div style={{ marginTop: '3px', fontWeight: 'bold', fontStyle: 'italic' }}>
                        ► {item.nota}
                      </div>
                    )}
                  </td>
                  <td>{infoUnidad(item.producto.unidad).formatear(Number(item.cantidad))}</td>
                  {/* Columna en blanco: la planta anota aquí el peso de báscula */}
                  <td style={{ height: '28px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
