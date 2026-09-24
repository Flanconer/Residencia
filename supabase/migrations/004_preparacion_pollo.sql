-- =========================================================
-- AVE Paraíso — Preparación del pollo natural
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- Cómo quiere el cliente que se prepare ese producto:
-- 'Natural', 'Sin piel', 'Deshuesado', 'Sin piel y deshuesado'.
-- Va en pedido_items y no en pedidos, porque un mismo pedido puede
-- llevar pechuga sin piel Y pierna natural al mismo tiempo.
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS preparacion TEXT;
