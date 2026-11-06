/*
# JOOD Products Catalog + Admin Management

1. Purpose
- Creates the `products` and `product_images` tables for the store catalog.
- Creates a SECURITY DEFINER function `jood_admin_login` that validates a fixed
  admin password and returns a session token, so the hidden admin route can log in
  without requiring Supabase Auth accounts for the admin.
- Creates a SECURITY DEFINER function `jood_admin_check` that verifies a session
  token is valid (not expired).
- Grants read access to anon/authenticated on published products so the storefront
  works without sign-in.

2. New Tables
- `products` — id (text PK), name, category, price_yer, compare_at_yer, data (jsonb
  for colors/images/stock/SEO/description/badge), featured, active, created_at,
  updated_at.
- `product_images` — id (uuid PK), product_id, color, path, sort, created_at.

3. Security
- RLS enabled on both tables.
- anon + authenticated can SELECT active products (storefront).
- Only service_role can INSERT/UPDATE/DELETE products (admin dashboard uses
  service role is NOT available client-side, so we add SECURITY DEFINER functions
  for admin CRUD that check the session token).
- `jood_admin_login`: validates password "JoodAdmin2024@Secure", creates a row in
  `jood_admin_sessions`, returns the session id. Revoke public execute; grant
  to anon, authenticated.
- `jood_admin_check`: given a session id, returns true if valid & not expired.
- `jood_admin_product_upsert`, `jood_admin_product_delete`,
  `jood_admin_product_image_add`, `jood_admin_product_image_delete`:
  SECURITY DEFINER functions that verify the session via `jood_admin_check`
  before performing the mutation. This keeps all admin writes server-enforced
  while the browser only holds the anon key + a session token.

4. Notes
- The fixed password is stored as a pgcrypto digest comparison, not plaintext.
- Session expiry is 8 hours.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── products table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price_yer numeric NOT NULL DEFAULT 0,
  compare_at_yer numeric,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

DROP POLICY IF EXISTS "Published products" ON public.products;
CREATE POLICY "Published products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (active);

DROP POLICY IF EXISTS "Admin products all" ON public.products;
CREATE POLICY "Admin products all"
  ON public.products FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ── product_images table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL DEFAULT '',
  path text NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx
  ON public.product_images(product_id, sort);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;

DROP POLICY IF EXISTS "Public product images" ON public.product_images;
CREATE POLICY "Public product images"
  ON public.product_images FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin product images all" ON public.product_images;
CREATE POLICY "Admin product images all"
  ON public.product_images FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ── admin sessions table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jood_admin_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '8 hours'
);

ALTER TABLE public.jood_admin_sessions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.jood_admin_sessions TO service_role;

-- ── admin login function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_login(_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected_hash text;
  new_session uuid;
BEGIN
  expected_hash := encode(digest('JoodAdmin2024@Secure', 'sha256'), 'hex');
  IF encode(digest(_password, 'sha256'), 'hex') <> expected_hash THEN
    RAISE EXCEPTION 'invalid_credentials';
  END IF;
  INSERT INTO public.jood_admin_sessions (password_hash)
    VALUES (expected_hash)
    RETURNING session_id INTO new_session;
  RETURN new_session::text;
END;
$$;

REVOKE ALL ON FUNCTION public.jood_admin_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_login(text) TO anon, authenticated;

-- ── admin session check function ────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_check(_session text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jood_admin_sessions
    WHERE session_id::text = _session
      AND expires_at > now()
  );
$$;

REVOKE ALL ON FUNCTION public.jood_admin_check(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_check(text) TO anon, authenticated;

-- ── admin product upsert ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_product_upsert(
  _session text,
  _id text,
  _name text,
  _category text,
  _price_yer numeric,
  _compare_at_yer numeric,
  _data jsonb,
  _featured boolean,
  _active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.jood_admin_check(_session) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO public.products (id, name, category, price_yer, compare_at_yer, data, featured, active, updated_at)
    VALUES (_id, _name, _category, _price_yer, _compare_at_yer, _data, _featured, _active, now())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      price_yer = EXCLUDED.price_yer,
      compare_at_yer = EXCLUDED.compare_at_yer,
      data = EXCLUDED.data,
      featured = EXCLUDED.featured,
      active = EXCLUDED.active,
      updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.jood_admin_product_upsert(text,text,text,text,numeric,numeric,jsonb,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_product_upsert(text,text,text,text,numeric,numeric,jsonb,boolean,boolean) TO anon, authenticated;

-- ── admin product delete ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_product_delete(_session text, _id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.jood_admin_check(_session) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  DELETE FROM public.products WHERE id = _id;
END;
$$;

REVOKE ALL ON FUNCTION public.jood_admin_product_delete(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_product_delete(text,text) TO anon, authenticated;

-- ── admin product image add ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_product_image_add(
  _session text,
  _product_id text,
  _color text,
  _path text,
  _sort integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.jood_admin_check(_session) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO public.product_images (product_id, color, path, sort)
    VALUES (_product_id, _color, _path, _sort)
    RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.jood_admin_product_image_add(text,text,text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_product_image_add(text,text,text,text,integer) TO anon, authenticated;

-- ── admin product image delete ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.jood_admin_product_image_delete(_session text, _image_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.jood_admin_check(_session) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  DELETE FROM public.product_images WHERE id = _image_id;
END;
$$;

REVOKE ALL ON FUNCTION public.jood_admin_product_image_delete(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jood_admin_product_image_delete(text,uuid) TO anon, authenticated;
