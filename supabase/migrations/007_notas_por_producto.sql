-- =========================================================
-- AVE Paraíso — Nota del cliente por producto
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- Indicación del cliente para ese producto en particular:
-- "partida en cuatro", "que sean 3 mollejas", "en filetes delgados".
-- Va en pedido_items (no en pedidos) porque es sobre UNA pieza, no sobre
-- todo el pedido. Solo se captura para pollo natural.
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS nota TEXT;

-- Límite de largo también en la base de datos, no solo en la página
ALTER TABLE pedido_items DROP CONSTRAINT IF EXISTS nota_largo_maximo;
ALTER TABLE pedido_items ADD CONSTRAINT nota_largo_maximo
    CHECK (nota IS NULL OR char_length(nota) <= 200);
