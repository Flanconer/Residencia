-- =========================================================
-- AVE Paraíso — Cuentas de cliente, direcciones guardadas y seguridad
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- ---------------------------------------------------------
-- 1. Ampliar la tabla de usuarios
-- ---------------------------------------------------------

-- 'cliente' o 'admin'. Así distinguimos quién puede entrar al panel.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'cliente';

-- Enlace con la cuenta de Supabase Auth. Es NULL para pedidos de invitado
-- (gente que compra sin registrarse).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- El teléfono ya no puede ser obligatorio al registrarse (se pide al pagar)
ALTER TABLE usuarios ALTER COLUMN telefono DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios (auth_id);

-- ---------------------------------------------------------
-- 2. Direcciones guardadas del cliente
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS direcciones (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    etiqueta TEXT,                      -- 'Casa', 'Trabajo', 'Casa de mamá'
    direccion_texto TEXT NOT NULL,
    codigo_postal TEXT,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    referencias TEXT,
    es_predeterminada BOOLEAN DEFAULT false,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones (usuario_id);

-- ---------------------------------------------------------
-- 3. Guardar el código postal en el pedido
-- ---------------------------------------------------------
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS codigo_postal TEXT;

-- ---------------------------------------------------------
-- 4. Función auxiliar: ¿el usuario actual es administrador?
--    SECURITY DEFINER evita recursión infinita al usarla dentro
--    de las políticas de la propia tabla usuarios.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM usuarios
        WHERE auth_id = auth.uid() AND rol = 'admin'
    );
$$;

-- Devuelve el id de la fila de `usuarios` que corresponde a la sesión actual
CREATE OR REPLACE FUNCTION mi_usuario_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT id FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ---------------------------------------------------------
-- 5. Seguridad a nivel de fila (RLS)
--    Sin esto, cualquiera con la clave pública podría leer TODOS
--    los pedidos y datos de TODOS los clientes.
-- ---------------------------------------------------------

ALTER TABLE categorias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items  ENABLE ROW LEVEL SECURITY;

-- Catálogo: lectura pública (cualquiera puede ver la tienda)
DROP POLICY IF EXISTS "catalogo lectura publica" ON categorias;
CREATE POLICY "catalogo lectura publica" ON categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "productos lectura publica" ON productos;
CREATE POLICY "productos lectura publica" ON productos FOR SELECT USING (true);

-- Solo el admin modifica el catálogo
DROP POLICY IF EXISTS "admin edita productos" ON productos;
CREATE POLICY "admin edita productos" ON productos FOR ALL
    USING (es_admin()) WITH CHECK (es_admin());

DROP POLICY IF EXISTS "admin edita categorias" ON categorias;
CREATE POLICY "admin edita categorias" ON categorias FOR ALL
    USING (es_admin()) WITH CHECK (es_admin());

-- Usuarios: cada quien ve y edita su propia fila; el admin ve todas
DROP POLICY IF EXISTS "usuario ve lo suyo" ON usuarios;
CREATE POLICY "usuario ve lo suyo" ON usuarios FOR SELECT
    USING (auth_id = auth.uid() OR es_admin());

DROP POLICY IF EXISTS "usuario actualiza lo suyo" ON usuarios;
CREATE POLICY "usuario actualiza lo suyo" ON usuarios FOR UPDATE
    USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

-- El registro y el checkout de invitado necesitan poder crear la fila
DROP POLICY IF EXISTS "alta de usuario permitida" ON usuarios;
CREATE POLICY "alta de usuario permitida" ON usuarios FOR INSERT WITH CHECK (true);

-- Direcciones: estrictamente privadas de cada cliente
DROP POLICY IF EXISTS "direcciones propias" ON direcciones;
CREATE POLICY "direcciones propias" ON direcciones FOR ALL
    USING (usuario_id = mi_usuario_id())
    WITH CHECK (usuario_id = mi_usuario_id());

-- Pedidos: el cliente ve los suyos, el admin ve todos.
-- El INSERT queda abierto para permitir compras sin registrarse.
DROP POLICY IF EXISTS "pedidos propios" ON pedidos;
CREATE POLICY "pedidos propios" ON pedidos FOR SELECT
    USING (usuario_id = mi_usuario_id() OR es_admin());

DROP POLICY IF EXISTS "crear pedido permitido" ON pedidos;
CREATE POLICY "crear pedido permitido" ON pedidos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin actualiza pedidos" ON pedidos;
CREATE POLICY "admin actualiza pedidos" ON pedidos FOR UPDATE
    USING (es_admin()) WITH CHECK (es_admin());

-- Items: siguen la visibilidad de su pedido
DROP POLICY IF EXISTS "items de pedidos propios" ON pedido_items;
CREATE POLICY "items de pedidos propios" ON pedido_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pedidos p
            WHERE p.id = pedido_items.pedido_id
              AND (p.usuario_id = mi_usuario_id() OR es_admin())
        )
    );

DROP POLICY IF EXISTS "crear items permitido" ON pedido_items;
CREATE POLICY "crear items permitido" ON pedido_items FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------
-- 6. Crear la fila en `usuarios` automáticamente al registrarse
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION crear_usuario_al_registrarse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO usuarios (auth_id, nombre, email, telefono)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Cliente'),
        NEW.email,
        NEW.raw_user_meta_data->>'telefono'
    )
    ON CONFLICT (auth_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS al_crear_auth_user ON auth.users;
CREATE TRIGGER al_crear_auth_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION crear_usuario_al_registrarse();

-- ---------------------------------------------------------
-- 7. IMPORTANTE: convierte tu cuenta en administrador
--    Cambia el correo por el que usas para entrar al panel.
-- ---------------------------------------------------------
-- Primero asegúrate de que exista la fila (si creaste la cuenta antes
-- de este script, el trigger no se disparó para ella):
INSERT INTO usuarios (auth_id, nombre, email, rol)
SELECT id, 'Administrador', email, 'admin'
FROM auth.users
WHERE email = 'CAMBIA_ESTO@tucorreo.com'
ON CONFLICT (auth_id) DO UPDATE SET rol = 'admin';
