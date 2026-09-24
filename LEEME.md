# Cambios de diseño — Parte 2 (AVE Paraíso)

Copia estos archivos dentro de tu proyecto `ave-paraiso-ecommerce`, reemplazando los que
ya existen (o creándolos, en el caso de los archivos nuevos).

## Archivos que REEMPLAZAN a los existentes
- `app/layout.tsx` → agrega la franja de ubicación, el botón "Mi cuenta", y coloca el
  nuevo footer + botón de WhatsApp
- `components/CategoriaIcono.tsx` → un ícono distinto para cada una de las 8 categorías
- `components/ProductoCard.tsx` → ahora es un componente interactivo: incluye selector
  de cantidad (+/-) y botón "Agregar" en rojo, sin necesidad de entrar al detalle del
  producto para comprar

## Archivos NUEVOS
- `components/BarraUbicacion.tsx` → el "📍 Ingresa tu dirección" junto al buscador
- `components/BotonWhatsApp.tsx` → botón flotante fijo, esquina inferior derecha
- `components/Footer.tsx` → métodos de pago, horarios de corte, aviso de privacidad
- `app/aviso-privacidad/page.tsx` → página básica de aviso de privacidad

## Después de copiar

```bash
npm run dev
```

No hace falta instalar nada nuevo — todo usa lo que ya tenías.

## 3 cosas que tienes que ajustar tú

1. **Número de WhatsApp real**: abre `components/BotonWhatsApp.tsx` y cambia
   `NUMERO_WHATSAPP` por el número real de la tienda (formato: 52 + lada + número, sin
   espacios, ej. `5217711234567`).

2. **"Mi cuenta" apunta al login de administrador (por ahora)**: el botón "Mi cuenta" del
   header manda a `/login`, que es la misma pantalla que usa la secretaria para entrar al
   panel de pedidos. Esto es solo temporal para que el botón ya esté visible y
   clicleable. Un sistema real de cuentas de cliente (registro, guardar direcciones
   frecuentes, historial de pedidos) es una función nueva que no existía antes — dime si
   quieres que la construyamos como siguiente paso, porque implica agregar tablas y
   lógica de registro además de la de administrador.

3. **Horarios de corte de ejemplo**: en `components/Footer.tsx` puse "antes de las 12:00
   pm / después de las 12:00 pm" como ejemplo. Cámbialos por los horarios reales del
   negocio.

## Nota sobre el aviso de privacidad

El texto de `app/aviso-privacidad/page.tsx` es un borrador básico — como vas a manejar
ubicación exacta de clientes, conviene que alguien con conocimiento legal lo revise antes
de operar formalmente. Ya lo dejé señalado dentro del archivo.
