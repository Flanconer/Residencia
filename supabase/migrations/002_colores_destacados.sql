-- =========================================================
-- AVE Paraíso — Colores por categoría + productos destacados
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- 1. Asignar el color real de cada categoría
UPDATE categorias SET color_hex = '#FFFFFF' WHERE slug = 'pollo-natural';   -- blanco
UPDATE categorias SET color_hex = '#5FC9B5' WHERE slug = 'empanizados';     -- verde menta
UPDATE categorias SET color_hex = '#2E8B6F' WHERE slug = 'marinados';       -- verde más oscuro
UPDATE categorias SET color_hex = '#F4C430' WHERE slug = 'para-guisar';     -- amarillo
UPDATE categorias SET color_hex = '#F4934A' WHERE slug = 'hamburguesas';    -- anaranjado
UPDATE categorias SET color_hex = '#7B4FA6' WHERE slug = 'embutidos';       -- morado
UPDATE categorias SET color_hex = '#F7B98C' WHERE slug = 'guisados';        -- anaranjado pálido
UPDATE categorias SET color_hex = '#C1272D' WHERE slug = 'alitas';          -- rojo

-- 2. Columna para marcar productos "más vendidos" en la página principal
--    (por ahora se marca a mano; cuando tengas historial real de pedidos,
--    esto se puede calcular automáticamente en vez de marcarse manualmente)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- 3. Ejemplo: marca 4 productos como destacados para probar la sección.
--    Cámbialos por los que realmente más se vendan.
UPDATE productos SET destacado = true
WHERE nombre IN ('Pollo entero', 'Pechuga', 'Nuggets', 'Alitas BBQ');
