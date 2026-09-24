-- =========================================================
-- Esquema inicial de base de datos - AVE Paraíso e-commerce
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- =========================================================

-- Categorías (para los colores de marca: amarillo, verde menta, morado, blanco)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,               -- 'Pollo natural', 'Empanizados', 'Embutidos', 'Caldo/Deshebrada'
    color_hex TEXT NOT NULL,            -- '#FFFFFF', '#5FC9B5', '#7B4FA6', '#F4C430'
    slug TEXT UNIQUE NOT NULL
);

-- Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES categorias(id),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    unidad TEXT DEFAULT 'kg',           -- 'kg', 'pieza', 'paquete'
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Usuarios (clientes que compran; el admin se maneja aparte con Supabase Auth)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    estado TEXT DEFAULT 'pendiente',    -- 'pendiente','confirmado','en_reparto','entregado','cancelado'
    metodo_pago TEXT NOT NULL,          -- 'en_linea' | 'contra_entrega'
    pagado BOOLEAN DEFAULT false,
    total NUMERIC(10,2) NOT NULL,

    -- Ubicación de entrega (estilo Mercado Libre)
    direccion_texto TEXT NOT NULL,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    referencias TEXT,                   -- "Portón negro, casa azul"

    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Detalle de cada pedido (qué productos y cuántos)
CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id),
    cantidad NUMERIC(10,2) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,   -- Precio congelado al momento de la compra
    subtotal NUMERIC(10,2) NOT NULL
);

-- Índice clave: para filtrar pedidos por día rápidamente en el panel admin
CREATE INDEX idx_pedidos_creado_en ON pedidos (creado_en);

-- =========================================================
-- Datos iniciales de ejemplo (puedes editarlos o borrarlos)
-- =========================================================

INSERT INTO categorias (nombre, color_hex, slug) VALUES
    ('Pollo natural', '#FFFFFF', 'pollo-natural'),
    ('Empanizados', '#5FC9B5', 'empanizados'),
    ('Embutidos', '#7B4FA6', 'embutidos'),
    ('Caldo y deshebrada', '#F4C430', 'caldo-deshebrada');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, unidad) VALUES
    (1, 'Pollo entero', 'Pollo fresco entero, listo para cocinar', 95.00, 'kg'),
    (1, 'Pechuga sin hueso', 'Pechuga de pollo limpia, sin hueso ni piel', 110.00, 'kg'),
    (2, 'Milanesa empanizada', 'Filete de pechuga empanizado, listo para freír', 130.00, 'kg'),
    (3, 'Salchicha de pollo', 'Salchicha artesanal de pollo', 75.00, 'paquete'),
    (4, 'Pollo deshebrado', 'Pechuga cocida y deshebrada, lista para usar', 140.00, 'kg');
