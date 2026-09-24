# Preparación del pollo y página de detalle

## PASO OBLIGATORIO: correr la migración

Ejecuta `supabase/migrations/004_preparacion_pollo.sql` en
**Supabase → SQL Editor → New query → Run**.

Es una sola línea: agrega la columna `preparacion` a `pedido_items`.
Sin esto, los pedidos con preparación fallarán al guardarse.

---

## Bug corregido: el botón invisible

En la captura que enviaste, "Agregar al carrito" se veía blanco sobre blanco.
La causa: `BotonAgregarCarrito.tsx` usaba `bg-ave-morado`, un color que dejó de
existir cuando cambiamos la paleta. Tailwind no falla cuando una clase no existe,
simplemente no aplica nada — por eso quedaba texto blanco sin fondo.

Encontré el mismo problema en otros 7 lugares y los corregí todos:
`BotonImprimir.tsx`, `TablaPedidosAdmin.tsx`, `pedido-confirmado`,
`admin/pedidos/[id]` y `carrito`.

Ese componente ya no existe: su lógica vive ahora en `DetalleProducto.tsx`.

---

## Página de detalle rediseñada

`components/DetalleProducto.tsx` ahora tiene:

- Etiqueta de categoría con su color
- Precio con unidad clara (`$120.00 / 500 g`)
- **Selector de cantidad** (+ / −) con subtotal en vivo
- **Botón "Comprar ahora"** — agrega y va directo al checkout
- **Botón "Agregar al carrito"** — agrega y te deja seguir comprando

---

## Opciones de preparación (solo pollo natural)

Al abrir un producto de la categoría **Pollo natural** aparece "¿Cómo lo quieres?"
con cuatro opciones:

- Natural
- Sin piel
- Deshuesado
- Sin piel y deshuesado

El resto de categorías (empanizados, marinados, embutidos, etc.) no muestran nada:
ya vienen preparados y se venden en paquete cerrado.

**Para editar las opciones**, abre `lib/utils/preparaciones.ts`. Todo está en un
solo lugar, y ahí mismo puedes habilitar preparaciones para otra categoría si algún
día hace falta. Agregué "Sin piel y deshuesado" porque en la práctica es una
combinación que se pide; si no la manejan, bórrala de ese archivo.

### Lo importante: la preparación llega hasta la planta

Una opción que solo se ve en la tienda no sirve de nada. Por eso la preparación
viaja por toda la cadena:

1. Se elige en el detalle del producto
2. El carrito la trata como **línea separada** — "Pechuga sin piel" y "Pechuga
   natural" son dos renglones distintos, porque se preparan diferente
3. Se guarda en `pedido_items.preparacion`
4. Se muestra en el panel de administración
5. **Aparece en negritas en su propia columna de la hoja de impresión**

Ese último punto es el que importa para la operación: la secretaria imprime la hoja
y la planta ve exactamente cómo preparar cada pieza.

---

## Cambio interno del carrito

Antes el carrito identificaba cada línea solo por `producto.id`. Ahora usa
`producto.id + preparación`, si no, pedir pechuga natural y pechuga sin piel en el
mismo pedido habría sumado las cantidades en una sola línea y se habría perdido una
de las dos preparaciones.

Efecto secundario: si tenías algo en el carrito de una sesión anterior, puede que se
vacíe la primera vez. Es normal y solo pasa una vez.
