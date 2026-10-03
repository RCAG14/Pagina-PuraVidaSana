-- Pegar y ejecutar una sola vez en Supabase Dashboard -> SQL Editor.
-- Crea la tabla de productos, su RLS, y siembra el catálogo actual.

create sequence if not exists products_id_seq start 1;

create table if not exists products (
  id text primary key default ('PV-' || lpad(nextval('products_id_seq')::text, 3, '0')),
  name text not null,
  category text not null check (length(trim(category)) > 0),
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  description text not null default '',
  image text not null,
  featured boolean not null default false,
  images text[] not null default '{}',
  benefits text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Permite categorías personalizadas creadas desde administración.
-- (Si la tabla ya existía con la lista fija de categorías, esto la actualiza.)
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (length(trim(category)) > 0);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

alter table products enable row level security;

drop policy if exists "public read" on products;
create policy "public read" on products
  for select
  to anon
  using (true);

-- Sin política de insert/update/delete para "anon" => deniega por defecto.
-- Las escrituras del admin usan la service role key, que evita RLS por completo.

insert into products (id, name, category, price, stock, description, image, featured, images, benefits, tags) values
('PV-001', 'Omega-3 Aceite de Pescado', 'Suplementos', 145, 32, 'Cápsulas de Omega-3 de alta pureza para salud cardiovascular y cerebral. Ideal para el clima seco de La Paz.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80', true, array['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80','https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80'], array['Apoya la salud cardiovascular','Favorece la función cognitiva','Reduce la inflamación articular'], array['Alta pureza','Libre de mercurio']),
('PV-002', 'Colágeno Hidrolizado + Vitamina C', 'Suplementos', 189, 18, 'Fórmula para piel, articulaciones y cabello. Absorción rápida y sabor natural a naranja.', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80', true, array['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80','https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80','https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80'], array['Mejora la elasticidad de la piel','Fortalece articulaciones','Favorece el crecimiento del cabello'], array['Sabor natural','Absorción rápida']),
('PV-003', 'Magnesio Quelado 400mg', 'Suplementos', 98, 45, 'Relaja músculos y mejora el descanso nocturno. Especialmente útil a gran altitud.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', false, array['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80','https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80','https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80'], array['Relaja la musculatura','Mejora la calidad del sueño','Reduce calambres en altura'], array['Alta absorción']),
('PV-004', 'Ashwagandha KSM-66', 'Suplementos', 135, 4, 'Adaptógeno premium para reducir estrés y equilibrar energía diaria.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80', true, array['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80','https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80'], array['Reduce el estrés y el cortisol','Equilibra la energía diaria','Mejora la claridad mental'], array['Adaptógeno','Extracto premium']),
('PV-005', 'Vitamina D3 5000 UI', 'Vitaminas', 75, 60, 'Soporte óseo e inmunológico. Recomendada en épocas de menor exposición solar.', 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80', true, array['https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80','https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80','https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80'], array['Fortalece huesos y dientes','Refuerza el sistema inmunológico','Compensa la baja exposición solar'], array['Alta dosis']),
('PV-006', 'Complejo B Forte', 'Vitaminas', 68, 28, 'Energía metabólica y sistema nervioso. Incluye B1, B6, B12 y ácido fólico.', 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80', false, array['https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80','https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80'], array['Aumenta la energía metabólica','Apoya el sistema nervioso','Incluye ácido fólico'], array['B1, B6, B12']),
('PV-007', 'Vitamina C Liposomal 1000mg', 'Vitaminas', 112, 22, 'Alta biodisponibilidad para defensas y antioxidante diario.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', true, array['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80','https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80','https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80'], array['Refuerza las defensas','Antioxidante de alta biodisponibilidad','Absorción superior a la vitamina C común'], array['Liposomal','Alta biodisponibilidad']),
('PV-008', 'Multivitamínico Diario Adulto', 'Vitaminas', 95, 3, 'Cobertura completa de micronutrientes esenciales para el ritmo paceño.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', false, array['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80','https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&q=80','https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80'], array['Cobertura completa de micronutrientes','Pensado para el ritmo de vida en altura','Una sola toma diaria'], array['Uso diario']),
('PV-009', 'Aceite Facial de Rosa Mosqueta', 'Cosmética Natural', 128, 15, 'Hidratación profunda y regeneración cutánea 100% natural, sin parabenos.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', true, array['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80','https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80','https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80'], array['Hidratación profunda','Favorece la regeneración cutánea','Reduce marcas y cicatrices'], array['Sin parabenos','100% Natural']),
('PV-010', 'Jabón Artesanal de Menta Andina', 'Cosmética Natural', 35, 50, 'Limpieza suave con aroma fresco de hierbas andinas. Ideal para piel sensible.', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80', false, array['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80','https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80'], array['Limpieza suave para piel sensible','Aroma fresco de hierbas andinas','Ingredientes naturales locales'], array['Artesanal','Piel sensible']),
('PV-011', 'Crema Corporal de Karité & Aloe', 'Cosmética Natural', 89, 0, 'Nutrición intensa contra el clima seco. Textura ligera de rápida absorción.', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', false, array['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80','https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80','https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80'], array['Nutrición intensa contra el clima seco','Absorción rápida sin dejar residuo graso','Calma la piel irritada'], array['Textura ligera']),
('PV-012', 'Serum Vitamina E + Ácido Hialurónico', 'Cosmética Natural', 155, 12, 'Antiedad y luminosidad natural. Fórmula vegana certificada.', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80', true, array['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80','https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80'], array['Efecto antiedad visible','Aporta luminosidad natural','Fórmula vegana certificada'], array['Vegano','Antiedad']),
('PV-013', 'Whey Protein Isolate 1kg Vainilla', 'Proteínas', 320, 14, 'Proteína aislada de alta pureza, bajo en lactosa. 25g por porción.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80', true, array['https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80','https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'], array['25g de proteína por porción','Bajo en lactosa','Ideal para recuperación muscular'], array['Alto en proteína','Bajo en lactosa']),
('PV-014', 'Proteína Vegetal de Arveja 750g', 'Proteínas', 275, 9, 'Opción vegana completa con aminoácidos esenciales. Sabor cacao.', 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&q=80', false, array['https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&q=80','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'], array['Perfil completo de aminoácidos esenciales','100% vegana','Sabor cacao natural'], array['Vegano','Sin lactosa']),
('PV-015', 'Creatina Monohidrato 300g', 'Proteínas', 165, 25, 'Fuerza y rendimiento deportivo. Micronizada para mejor disolución.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80', false, array['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'], array['Aumenta fuerza y rendimiento','Micronizada para mejor disolución','Respaldada por evidencia científica'], array['Micronizada']),
('PV-016', 'BCAA 2:1:1 Polvo 250g', 'Proteínas', 148, 2, 'Recuperación muscular post-entrenamiento. Sabor limón natural.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', false, array['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'], array['Acelera la recuperación muscular','Reduce la fatiga en el entrenamiento','Sabor limón natural'], array['Post-entrenamiento'])
on conflict (id) do nothing;

-- Avanza la secuencia más allá del último id sembrado (PV-016) para que el
-- próximo producto creado desde el admin no colisione.
select setval('products_id_seq', 16, true);
