# Cuentas, búsqueda y ubicación — guía de instalación

## ⚠️ PASO 1 OBLIGATORIO: correr la migración

Abre `supabase/migrations/003_cuentas_y_direcciones.sql` y **antes de ejecutarlo**,
busca la última línea y cambia el correo:

```sql
WHERE email = 'CAMBIA_ESTO@tucorreo.com'
```

Pon ahí el correo con el que entras al panel de administración. Si no lo cambias,
**te vas a quedar fuera de tu propio panel**, porque ahora se exige rol de
administrador, no solo tener sesión.

Luego pégalo en **Supabase → SQL Editor → New query → Run**.

## PASO 2: revisa la zona de cobertura

Abre `lib/utils/cobertura.ts`. Ahí están, en un solo lugar y a propósito:

- `CENTRO_PACHUCA` — punto de referencia
- `RADIO_COBERTURA_KM` — actualmente 12 km
- `CP_MINIMO` / `CP_MAXIMO` — actualmente 42000 a 42199

**Estos valores son una estimación mía, no un dato confirmado.** Confírmalos con
el negocio: si el rango real de reparto es distinto, vas a rechazar clientes
válidos o aceptar pedidos que no se pueden entregar.

---

## Qué se construyó

### Búsqueda
- Buscador del encabezado funcional, con sugerencias mientras escribes
  (`components/BarraBusqueda.tsx`)
- Página de resultados en `/buscar?q=...`
- Busca por nombre y por descripción, sin distinguir acentos de mayúsculas

### Cuentas de cliente
- `/registro` — alta con nombre, teléfono, correo y contraseña
- `/login` — ahora sirve para clientes y administradores; redirige según el rol
- `/mi-cuenta` — perfil, libreta de direcciones e historial de pedidos
- El menú del encabezado cambia solo: muestra "Entrar" o el nombre del cliente

### Direcciones guardadas
- El cliente guarda varias direcciones con etiqueta ("Casa", "Trabajo")
- En el checkout se precargan y se eligen con un clic
- Se puede marcar una como predeterminada

### Ubicación estilo Mercado Libre
`components/SelectorUbicacion.tsx` hace el flujo completo:
1. Botón "Usar mi ubicación actual" (pide permiso de GPS al navegador)
2. Mapa con pin arrastrable centrado en esa ubicación
3. Al mover el pin, se rellenan solos la dirección y el código postal
   (vía `/api/geocodificar`, que usa OpenStreetMap — gratis, sin API key)
4. El cliente corrige a mano lo que haga falta
5. Se valida la cobertura antes de aceptar

### Compra sin registrarse
Se conservó el checkout de invitado. Obligar a registrarse antes de la primera
compra suele costar ventas; así, quien quiera cuenta la crea, y quien no, compra
igual.

---

## Seguridad: lo más importante de esta entrega

Hasta ahora **no había ninguna restricción de acceso a los datos**. Con la clave
pública (que va en el navegador y cualquiera puede leer) se podían consultar
todos los pedidos, con nombres, teléfonos y direcciones exactas de todos los
clientes. También bastaba con registrarse para poder entrar al panel de
administración.

La migración 003 corrige ambas cosas:

- **Row Level Security (RLS)** en todas las tablas: cada cliente solo ve sus
  propios pedidos y direcciones; el catálogo queda público; solo el admin ve todo
- **Rol de administrador**: `app/admin/layout.tsx` ahora exige `rol = 'admin'`
- **`GET /api/pedidos`** exigía solo sesión; ahora exige ser administrador
- **La cobertura se revalida en el servidor**, no solo en el navegador

Esto es un buen apartado para tu informe de residencia: identificaste una falla
de control de acceso y la corrigiste con defensa en capas (validación en cliente
para la experiencia, validación en servidor para la seguridad, y RLS en la base
de datos como última línea).

---

## Dos cosas que quedaron pendientes a propósito

1. **El pago en línea no cobra nada todavía.** La opción existe en el checkout,
   pero está marcada como no disponible y el pedido se registra igual. Integrar
   pagos reales (Stripe, Mercado Pago) es un proyecto aparte, con su propio
   registro fiscal y conciliación. Dime si quieres abordarlo.

2. **La confirmación de correo de Supabase.** Por defecto Supabase envía un
   correo de confirmación al registrarse. Para desarrollo puedes desactivarlo en
   **Authentication → Providers → Email → "Confirm email" = off**, así pruebas
   más rápido. Vuelve a activarlo antes de producción.
