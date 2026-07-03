-- تتبع الأحداث: نقرات واتساب ومشاهدات الملف
CREATE TABLE IF NOT EXISTS click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baker_id uuid NOT NULL REFERENCES bakers(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('whatsapp_click', 'profile_view')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_click_events_baker ON click_events (baker_id, event_type, created_at);

ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
-- لا سياسات عامة: الكتابة والقراءة عبر service key فقط (API routes)

-- إدراج عام مسموح للأحداث الصالحة على خبازين نشطين (لا حاجة لمفتاح service)
CREATE POLICY click_events_public_insert ON click_events FOR INSERT WITH CHECK (
  event_type IN ('whatsapp_click', 'profile_view')
  AND EXISTS (SELECT 1 FROM bakers b WHERE b.id = click_events.baker_id AND b.is_active = true)
);
