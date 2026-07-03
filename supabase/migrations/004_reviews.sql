-- تقييمات العملاء (تُنشر بعد موافقة الإدارة)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id uuid NOT NULL REFERENCES bakers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_baker ON reviews (baker_id, is_approved, created_at);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_public_read ON reviews FOR SELECT USING (
  is_approved = true AND EXISTS (SELECT 1 FROM bakers b WHERE b.id = reviews.baker_id AND b.is_active = true)
);
CREATE POLICY reviews_public_insert ON reviews FOR INSERT WITH CHECK (is_approved = false);
