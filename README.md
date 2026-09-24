# AVE Paraíso — E-commerce

Tienda en línea para AVE Paraíso (pollo natural y productos procesados). Proyecto de
residencia profesional. Stack: **Next.js (App Router) + TypeScript + Tailwind CSS +
Supabase (PostgreSQL + Auth)**.

## Requisitos previos

- Node.js 18 o superior instalado (verifica con `node -v`)
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- VS Code (o el editor que prefieras)

## 1. Instalar dependencias

Abre este proyecto en VS Code, abre una terminal integrada (`Ctrl+ñ` o `Terminal → New
Terminal`) y corre:

```bash
npm install
```

Esto descarga Next.js, Supabase, Tailwind, Leaflet (para el mapa del checkout) y todo lo
demás listado en `package.json`.

## 2. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New Project**.
2. Ponle un nombre (ej. `ave-paraiso`) y una contraseña de base de datos (guárdala).
3. Espera a que termine de aprovisionarse (1-2 minutos).
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

## 3. Configurar variables de entorno

Duplica el archivo `.env.local.example`, renómbralo a `.env.local`, y pega ahí los
valores que copiaste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

**`.env.local` nunca se sube a git** (ya está en `.gitignore`).

## 4. Cargar el esquema de base de datos

1. En el dashboard de Supabase, ve a **SQL Editor → New query**.
2. Abre el archivo `supabase/migrations/001_init.sql` de este proyecto, copia todo su
   contenido y pégalo ahí.
3. Dale **Run**. Esto crea las tablas (`categorias`, `productos`, `usuarios`, `pedidos`,
   `pedido_items`) y carga algunos productos de ejemplo.

## 5. Crear tu usuario de administrador

El panel `/admin` usa Supabase Auth (no la tabla `usuarios`, que es solo para clientes).

1. Ve a **Authentication → Users → Add user** en el dashboard de Supabase.
2. Crea un usuario con tu correo y una contraseña.
3. Con ese correo y contraseña vas a entrar en `/login`.

## 6. Correr el proyecto en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — deberías ver el catálogo con los
productos de ejemplo. El panel de administración está en
[http://localhost:3000/admin](http://localhost:3000/admin) (te pedirá login).

## 7. Desplegar gratis en Vercel

```bash
git init
git add .
git commit -m "Proyecto inicial AVE Paraíso"
gh repo create ave-paraiso-ecommerce --public --source=. --push
```

(Si no tienes `gh` instalado, sube el repo manualmente desde github.com → New repository).

Luego:
1. Entra a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importa el repositorio de GitHub.
3. En **Environment Variables**, agrega las mismas dos variables de tu `.env.local`.
4. Dale **Deploy**. En un par de minutos tienes una URL pública.

Cada vez que hagas `git push`, Vercel vuelve a desplegar automáticamente.

## Estructura del proyecto

```
app/            → Vistas y rutas (páginas públicas, checkout, admin, API)
components/     → Componentes de UI reutilizables
lib/models/     → Lógica de acceso a datos (funciones tipo "modelo")
lib/supabase/   → Clientes de conexión a la base de datos
lib/utils/      → Funciones auxiliares (formato de fecha, totales, carrito)
types/          → Tipos de TypeScript compartidos
styles/         → CSS global y de impresión (print.css)
supabase/       → Esquema SQL versionado
```

## Notas para el informe de residencia

- El precio de cada producto se "congela" en `pedido_items.precio_unitario` al momento
  de la compra, para que cambios futuros de precio no alteren pedidos históricos.
- El total del pedido siempre se recalcula en el servidor (`app/api/pedidos/route.ts`),
  nunca se confía en el total enviado desde el navegador — evita manipulación de precios.
- El panel `/admin` está protegido a nivel de layout (`app/admin/layout.tsx`), así que
  todas las rutas debajo de `/admin/*` heredan la protección automáticamente.
- La función de impresión usa `@media print` puro en `styles/print.css`: el navegador
  hace todo el trabajo de generar una hoja limpia, sin necesidad de generar PDFs en el
  servidor.
