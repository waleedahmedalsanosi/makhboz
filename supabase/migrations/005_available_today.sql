-- "متوفر اليوم": تاريخ آخر تفعيل للحالة — تظهر الشارة فقط إذا كان التاريخ هو اليوم
ALTER TABLE bakers ADD COLUMN IF NOT EXISTS available_today_date date;
