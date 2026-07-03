-- نظام الطلبات v1.0: الطلب سجل فقط — واتساب مصدر الحقيقة (قرار D14)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  baker_id uuid NOT NULL REFERENCES bakers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_ip text,
  items jsonb NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  note text,
  status text NOT NULL DEFAULT 'new',
  view_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_baker ON orders (baker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone_time ON orders (customer_phone, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_ip_time ON orders (customer_ip, created_at);

-- لا سياسات عامة: كل العمليات عبر API بمفتاح service والتحقق في طبقة الكود
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- تجميع إحصاءات الأحداث على الخادم بدل سحب كل الصفوف (قرار D13)
CREATE OR REPLACE FUNCTION click_event_stats()
RETURNS TABLE (baker_id uuid, event_type text, cnt bigint)
LANGUAGE sql STABLE
AS $$
  SELECT baker_id, event_type, count(*) FROM click_events GROUP BY 1, 2
$$;

REVOKE EXECUTE ON FUNCTION click_event_stats() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION order_counts_per_baker()
RETURNS TABLE (baker_id uuid, cnt bigint)
LANGUAGE sql STABLE
AS $$
  SELECT baker_id, count(*) FROM orders GROUP BY 1
$$;
REVOKE EXECUTE ON FUNCTION order_counts_per_baker() FROM anon, authenticated;
