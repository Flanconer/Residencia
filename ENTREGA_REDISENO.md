# Rediseño completo y panel administrativo — guía de instalación

## ⚠️ Tres pasos obligatorios antes de arrancar

### 1. Correr la migración 006
`supabase/migrations/006_pagos_y_fotos.sql` en **Supabase → SQL Editor → Run**.
Agrega el registro de pagos y crea el almacenamiento para las fotos de productos.

### 2. Agregar la llave de servicio a `.env.local`
En Supabase → **Project Settings → API**, copia la llave **`service_role`** (la
secreta, no la `anon`) y agrégala a tu `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=la-llave-que-copiaste
```

Cuando lo subas a Vercel, agrégala también en sus variables de entorno.

**Nunca le pongas el prefijo `NEXT_PUBLIC_`**: eso la mandaría al navegador y
cualquiera tendría acceso total a la base de datos. Tampoco la subas a GitHub
(`.env.local` ya está en `.gitignore`).

Sin esta llave, **nadie podrá hacer pedidos** (ver "Bug corregido 1").

### 3. Llenar `lib/config/negocio.ts`
Ahí está todo lo configurable del negocio, en un solo lugar:

- `whatsapp` — **está vacío**. El botón flotante tenía un comentario que decía que
  ya estaba configurado, pero el número estaba en blanco.
- `transferencia` — banco, titular y CLABE. Se incluyen en el mensaje de WhatsApp
  con el total final. Mientras estén vacíos, el mensaje simplemente no los muestra.
- `imagenHero` — cuando tengas la foto principal, ponla en `public/` y escribe aquí
  su ruta.
- Horarios de corte y días de entrega.

---

## Bugs corregidos en esta entrega

### 1. La compra como invitado no funcionaba (grave, era mío)
Cuando agregué la seguridad por filas (RLS) en la migración 003, un invitado sin
sesión ya no podía guardar su pedido: la base de datos le impedía "ver" el pedido
recién creado y la inserción fallaba. Probando con tu cuenta no se notaba.

Ahora el servidor registra los pedidos con la llave de servicio, pero **solo
después de validar todo**: precios reales de la base de datos, cobertura de la
zona y datos obligatorios. Ver `lib/supabase/admin.ts`.

### 2. Zona horaria (habría confundido a la secretaria)
El sistema calculaba "hoy" en hora UTC, que va 6 horas adelante de México. A partir
de las 6 pm, el panel ya creía que era el día siguiente y los pedidos de la noche
aparecían en el día equivocado. En Vercel empeoraba: sus servidores corren en UTC,
así que hasta las horas mostradas salían 6 horas adelantadas.

Todo se calcula ahora en hora de la Ciudad de México (`lib/utils/formatoFecha.ts`).

### 3. Pollo natural sin preparación
Desde la tarjeta del catálogo se podía agregar pollo natural directo al carrito,
sin elegir si iba natural, sin piel o deshuesado. La planta no habría sabido cómo
prepararlo. Ahora esas tarjetas dicen "Elegir preparación" y llevan al detalle.

### 4. Menores
- El footer todavía ofrecía "Tarjeta (pago en línea)", que ya habíamos quitado.
- El contador del carrito no se actualizaba al agregar productos desde otra parte
  de la página; ahora todos los componentes del carrito se sincronizan.

---

## Lo nuevo para el cliente

**Página principal como landing**: hero con el azul de sus volantes, fichas de
categoría con sus colores de marca, "Cómo funciona" en 3 pasos (que explica desde
el inicio lo del cobro por peso), los más pedidos, y un verificador de cobertura
por código postal.

**Sin cuadros grises**: mientras no haya foto, cada producto se muestra sobre el
color de su categoría con su ícono. Al subir una foto desde el panel, la reemplaza.

**Franja de colores de marca**: bajo el hero, en el footer y en el login, igual
que en sus empaques.

**Login y registro** con diseño de pantalla dividida.

**Mi cuenta**: seguimiento del pedido con barra de avance (recibido, preparando,
pesado, en camino, entregado), total final cuando ya se pesó, botón **"Volver a
pedir"** que repite un pedido anterior con sus mismas preparaciones, y datos
editables.

**Barra "Enviar a"**: con sesión, muestra la dirección predeterminada del cliente
y le deja cambiar entre sus direcciones; la que elige es la que el checkout
precarga.

**Encabezado**: fijo al hacer scroll, contador en el carrito, y buscador visible
también en celular.

## Lo nuevo en el panel

**Resumen del día**: por preparar, en camino, entregados, cuánto se cobró y
cuánto falta por cobrar.

**Aviso de pedidos nuevos**: revisa cada 30 segundos. Si llega un pedido, aparece
un aviso y el título de la pestaña cambia, aunque la secretaria esté en otra.

**Productos** (`/admin/productos`): cambiar precios, marcar agotados, elegir
destacados, subir fotos y agregar productos nuevos. Sin entrar a Supabase. Esto es
lo que permite que el sistema siga funcionando cuando tú ya no estés.

**Registro de pago**: en el detalle de cada pedido, "Pagó en efectivo" o "Pagó por
transferencia". Queda registrado cuándo y cómo.

**Botón "Abrir ubicación en Google Maps"** en cada pedido, para el repartidor.

---

## Pendiente antes de abrirlo al público

**Actualizar Next.js.** Las vulnerabilidades que vimos con `npm audit` siguen ahí.
Para la prueba en Vercel y la demo con la jefa está bien, pero antes de anunciarlo
a los clientes hay que migrar a Next.js 16. Son cambios mecánicos en varios
archivos; lo hacemos juntos cuando llegues a ese punto.

---

## Actualización: precios más claros

El cliente ahora ve en cada paso **cuánto pide**, **a cuánto está** y **por qué el
total es aproximado**:

- **Precio por unidad de venta**: "$150.00 por kg" o "$120.00 por paquete de 500 g",
  en lugar de solo el número.
- **Pregunta según el producto**: "¿Cuántos kilos?" o "¿Cuántos paquetes?".
- **Kilos de medio en medio**: el pollo natural se puede pedir en 1.5 kg, 2.5 kg,
  etc. Antes solo aceptaba kilos enteros.
- **El cálculo a la vista**: "1.5 kg × $150.00 = aproximadamente $225.00".
- **Recuadro explicativo** con el mismo mensaje en el detalle del producto, el
  carrito y el checkout (`components/NotaPrecioPorPeso.tsx`). Si quieres ajustar el
  texto, es un solo archivo.
- Botón "Pedir ahora" en lugar de "Comprar ahora", y "Total aproximado" en lugar de
  "Estimado".

### Productos de pollo natural que ya no ofrecen preparación
El huevo, la molida, el filete y la fajita están en la categoría "Pollo natural",
así que antes ofrecían "sin piel" o "deshuesado", que no tiene sentido para ellos.
Ahora se excluyen por palabra clave en `lib/utils/preparaciones.ts`
(`PRODUCTOS_SIN_PREPARACION`). **Confirma la lista con la planta.**

### Validación nueva en el servidor
La API de pedidos no revisaba las cantidades. Alguien podía mandar una cantidad
negativa directamente y bajar el total, o pedir un producto marcado como agotado.
Ahora el servidor rechaza: cantidades de cero o negativas, fracciones en productos
por paquete, más de 100 unidades de un producto, productos agotados, y
preparaciones que no correspondan al producto.

---

## Actualización: cuartos de kilo, indicaciones por producto y pedido mínimo

### PASO OBLIGATORIO
Ejecuta `supabase/migrations/007_notas_por_producto.sql` en Supabase. Sin ella,
los pedidos con indicaciones fallarán al guardarse.

### Cuartos de kilo
El pollo natural se pide por cuartos: ¼, ½, ¾, 1, 1¼ kg... Mínimo 250 g. Se muestra
como en la carnicería, no como "0.25". El selector arranca en ½ kg (lo más pedido)
y hay atajos para ¼, ½, 1 y 2 kg. Se configura en `lib/utils/unidades.ts`.

### Indicaciones para la planta
En los productos de pollo natural hay un cuadro opcional para indicaciones como
"partida en cuatro" o "que sean 3 mollejas" (máximo 200 caracteres). La indicación
va con ese producto en particular:

- El mismo producto con indicaciones distintas son dos líneas en el carrito
- Aparece en el carrito, el checkout, "Mi cuenta" y el panel
- **En la hoja de impresión sale en negritas bajo la preparación**, que es donde
  la planta la lee
- "Volver a pedir" la conserva

El campo general del checkout, que antes decía "Notas para la planta", ahora es
**"Indicaciones para la entrega"** ("tocar el timbre"). Así cada nota llega a quien
la necesita: la planta ve las de corte, el repartidor las de entrega.

### Pedido mínimo (desactivado hasta que tengas el monto)
En `lib/config/negocio.ts` está `pedidoMinimo: 0`. Cuando la jefa confirme el monto,
cámbialo ahí. Al activarlo:

- El carrito muestra una barra de "te faltan $X" y no deja continuar
- El checkout avisa y bloquea el envío
- El servidor lo valida con los precios reales (no se puede saltar)
- La sección "Entregamos en..." de la página principal lo muestra

Está en 0 a propósito: un monto inventado que se olvide cambiar rechazaría pedidos
reales.
