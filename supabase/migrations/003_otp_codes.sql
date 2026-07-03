-- رموز التحقق OTP عبر واتساب
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes (phone, created_at);
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
-- لا سياسات عامة: الوصول عبر service key فقط
