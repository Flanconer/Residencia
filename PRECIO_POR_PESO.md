# Precio estimado vs. precio final por peso

## PASO OBLIGATORIO: correr la migración

Ejecuta `supabase/migrations/005_precio_final_por_peso.sql` en
**Supabase → SQL Editor → New query → Run**.

Ojo: esta migración **renombra la columna `total` a `total_estimado`**. Si tienes
pedidos de prueba, se conservan. El script se puede volver a ejecutar sin romper
nada.

---

## El problema que resolvimos

La plataforma asumía "el cliente compra por $460 y eso paga". El negocio funciona
distinto: el cliente **pide**, la planta prepara y pesa, y de ahí sale el cobro.
Poner una nota en letras chiquitas no alcanzaba, porque la estructura de datos
seguía diciendo que existía un precio único y cerrado.

Ahora cada pedido guarda **dos montos**:

- `total_estimado` — calculado al hacer el pedido, con precios de lista
- `total_final` — capturado tras pesar. Es `NULL` hasta que se pesa

Y cada producto del pedido guarda `cantidad` (lo que pidió el cliente) y
`cantidad_real` (lo que marcó la báscula). Se conservan las dos para poder
comparar después.

---

## El flujo completo, tal como quedó

**1. El cliente hace su pedido**
Ya no ve "Total" en ninguna parte: ve "Estimado", con una nota que explica que el
precio final se calcula al pesar. El botón dice "Hacer pedido", no "Confirmar
pedido — $460".

**2. Se imprime la hoja para la planta**
La hoja ahora trae una **columna en blanco de "Peso real"**. La planta anota ahí lo
que marca la báscula, igual que hace hoy a mano.

**3. La secretaria captura los pesos**
En `/admin/pedidos/[id]` hay una pantalla de captura: escribe el peso de cada
producto y el total se recalcula en vivo. También muestra cuánto subió o bajó
respecto al estimado. Al guardar, el pedido pasa a estado "Pesado".

**4. Se le avisa al cliente**
Aparece un botón "Avisar al cliente por WhatsApp" que abre WhatsApp con el mensaje
ya escrito: el desglose con pesos reales y el total. Al usarlo, el pedido pasa a
"En reparto" y queda registrado que ya se avisó.

**5. Se cobra al entregar**
Como hasta ahora.

---

## Decisiones que tomé y conviene que revises

**Quité la opción de pago en línea.** No se puede cobrar una tarjeta antes de saber
el monto. Dejarla visible prometía algo que no funciona. Si más adelante quieren
cobrar en línea, lo natural sería mandar un enlace de pago *después* de pesar.

**El precio unitario no se vuelve a consultar al pesar.** Se usa el que quedó
congelado cuando el cliente pidió. Si el precio de lista sube entre el pedido y la
entrega, se le respeta al cliente el precio del día que pidió. Me pareció lo
correcto, pero es una decisión de negocio — si prefieren lo contrario, se cambia en
`registrarPesos()` dentro de `lib/models/pedidos.ts`.

**Nuevos estados**: `pendiente → en_preparacion → pesado → en_reparto → entregado`.
El estado `confirmado` anterior se convirtió en `en_preparacion`. Hay un selector en
el detalle del pedido para moverlos a mano.

---

## Para tu informe de residencia

Este cambio es un buen ejemplo de algo que vale la pena documentar: el sistema
inicial modelaba una transacción de precio cerrado, que es el supuesto por defecto
de cualquier e-commerce, pero no correspondía al proceso real de un negocio que
vende por peso. Detectarlo antes de la puesta en marcha y rediseñar el modelo de
datos (en vez de parchearlo con una advertencia en la interfaz) es exactamente el
tipo de análisis que se espera de una residencia de ingeniería.
