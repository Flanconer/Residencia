-- =========================================================
-- AVE Paraíso — Registro de pagos y fotos de productos
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- ---------------------------------------------------------
-- 1. Registro de pagos
--    `metodo_pago` es lo que el cliente eligió al pedir; aquí se
--    guarda cómo pagó REALMENTE, que es lo que registra la secretaria.
-- ---------------------------------------------------------
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_cobro TEXT;   -- 'efectivo' | 'transferencia'
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_en TIMESTAMPTZ;

-- ---------------------------------------------------------
-- 2. Almacenamiento de fotos de productos (Supabase Storage)
--    Lectura pública (las fotos se ven en la tienda), escritura
--    solo para administradores.
-- ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "fotos productos lectura publica" ON storage.objects;
CREATE POLICY "fotos productos lectura publica" ON storage.objects
    FOR SELECT USING (bucket_id = 'productos');

DROP POLICY IF EXISTS "fotos productos admin sube" ON storage.objects;
CREATE POLICY "fotos productos admin sube" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'productos' AND public.es_admin());

DROP POLICY IF EXISTS "fotos productos admin actualiza" ON storage.objects;
CREATE POLICY "fotos productos admin actualiza" ON storage.objects
    FOR UPDATE USING (bucket_id = 'productos' AND public.es_admin());

DROP POLICY IF EXISTS "fotos productos admin borra" ON storage.objects;
CREATE POLICY "fotos productos admin borra" ON storage.objects
    FOR DELETE USING (bucket_id = 'productos' AND public.es_admin());
