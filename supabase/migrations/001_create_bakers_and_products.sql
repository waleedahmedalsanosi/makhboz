-- Bakers table (Saudi Arabia rebuild)
CREATE TABLE IF NOT EXISTS public.bakers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username       text UNIQUE NOT NULL,
  display_name   text NOT NULL,
  city           text NOT NULL,
  bio            text,
  avatar_url     text,
  whatsapp_number text NOT NULL,
  is_active      boolean NOT NULL DEFAULT false,
  is_verified    boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id     uuid NOT NULL REFERENCES public.bakers(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  price        numeric(10,2) NOT NULL,
  weight_grams integer,
  image_url    text,
  is_available boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bakers_city_idx ON public.bakers(city) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_baker_idx ON public.products(baker_id) WHERE is_available = true;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER bakers_updated_at
  BEFORE UPDATE ON public.bakers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bakers_public_read" ON public.bakers
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM public.bakers b WHERE b.id = baker_id AND b.is_active = true)
  );

CREATE POLICY "bakers_public_insert" ON public.bakers
  FOR INSERT WITH CHECK (is_active = false AND is_verified = false);
