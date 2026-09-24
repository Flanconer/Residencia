-- =========================================================
-- AVE Paraíso — Precio estimado vs. precio final por peso
--
-- El negocio no vende a precio cerrado: el cliente hace un pedido,
-- la planta lo prepara y pesa, y de ahí sale el cobro real. La base
-- de datos ahora refleja eso: el pedido guarda lo que se estimó al
-- momento de pedir Y lo que realmente se cobró al pesar.
--
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- ---------------------------------------------------------
-- 1. El "total" pasa a llamarse "total_estimado"
--    Se hace dentro de un bloque para que el script se pueda
--    volver a ejecutar sin error si ya se aplicó.
-- ---------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pedidos' AND column_name = 'total'
    ) THEN
        ALTER TABLE pedidos RENAME COLUMN total TO total_estimado;
    END IF;
END $$;

-- ---------------------------------------------------------
-- 2. Campos del cierre del pedido
-- ---------------------------------------------------------

-- Lo que realmente se cobra, capturado por la secretaría tras pesar.
-- NULL mientras el pedido no se haya pesado.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS total_final NUMERIC(10,2);

-- Cuándo se capturaron los pesos y cuándo se avisó al cliente
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pesado_en TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS notificado_en TIMESTAMPTZ;

-- ---------------------------------------------------------
-- 3. Peso real por producto
--    `cantidad` es lo que pidió el cliente; `cantidad_real` es lo
--    que salió de la báscula. Se guardan ambas para poder comparar
--    lo estimado contra lo entregado.
-- ---------------------------------------------------------
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS cantidad_real NUMERIC(10,2);
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS subtotal_real NUMERIC(10,2);

-- ---------------------------------------------------------
-- 4. Estados que reflejan el flujo real de trabajo
--    pendiente -> en_preparacion -> pesado -> en_reparto -> entregado
--    (el estado 'confirmado' anterior queda como 'en_preparacion')
-- ---------------------------------------------------------
UPDATE pedidos SET estado = 'en_preparacion' WHERE estado = 'confirmado';
