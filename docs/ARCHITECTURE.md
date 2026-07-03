# خطة المعمارية — مخبوز

**الإصدار:** 1.0 · **التاريخ:** يوليو 2026

---

## 1. نظرة عامة

```
المستخدم (موبايل/ويب)
        │ HTTPS
        ▼
   nginx (makhboz.net + شهادة Let's Encrypt)
        │ proxy → :3000
        ▼
   Next.js 16 (App Router, Turbopack) — PM2 على دروبلت DigitalOcean
        │ @supabase/supabase-js
        ▼
   Supabase (Postgres + RLS + Storage)
```

- **الواجهة والخادم:** تطبيق Next.js واحد (SSR + API Routes) — لا فصل بين واجهة وباك إند.
- **قاعدة البيانات:** Supabase Postgres مع Row Level Security كخط دفاع أساسي.
- **الاستضافة:** دروبلت DigitalOcean واحد (`159.223.96.246`) يدير nginx + PM2.
- **النشر:** GitHub Actions ينشر تلقائياً عند كل push إلى `main`.

## 2. طبقات الوصول للبيانات

المبدأ الحاكم: **العام يقرأ بمفتاح anon، والمميّز يكتب بمفتاح service** (ملف `lib/supabase/server.ts`):

| العميل | المفتاح | يستخدمه | الحماية |
|---|---|---|---|
| `createServerClient()` | anon | الرئيسية، ملف الخباز، sitemap | سياسات RLS فقط |
| `createAdminClient()` | service_role (يسقط إلى anon إذا غاب) | الإدارة، التعديل، الرفع، التسجيل | تحقق بالكود (secret/token) ثم صلاحية كاملة |

هذا الفصل يضمن أن **الموقع العام يعمل حتى لو تعطّل مفتاح service** — درس مستفاد من عطل حقيقي.

## 3. نموذج البيانات

```
bakers                          products
──────                          ────────
id            uuid PK           id            uuid PK
username      text UNIQUE       baker_id      uuid FK → bakers
display_name  text              name          text
city          text              price         numeric
bio           text NULL         weight_grams  int NULL
whatsapp_number text            category      text ('كسرة'…'أخرى')
avatar_url    text NULL         image_url     text NULL
is_active     bool (بوابة النشر) is_available  bool
is_verified   bool (شارة توثيق)  created_at    timestamptz
edit_token    uuid UNIQUE (مفتاح التعديل الذاتي)
created_at    timestamptz
```

### سياسات RLS النافذة

| الجدول | العملية | الشرط |
|---|---|---|
| bakers | SELECT | `is_active = true` |
| bakers | INSERT | `is_active = false AND is_verified = false` |
| products | SELECT | `is_available = true` وخبازها نشط |
| غير ذلك | — | مرفوض (يتطلب service key) |

### Storage

حاويتان عامتان: `avatars` و `products`. الرفع عبر API فقط (تحقق token + حد 5MB + أنواع صور فقط)، مسار الملف `{baker_id}/{timestamp}.{ext}`.

## 4. المسارات

### صفحات (SSR، `revalidate = 0` للديناميكي)

| المسار | الوصف | الوصول |
|---|---|---|
| `/` | القائمة + بحث + فلاتر (مدينة، صنف) | عام |
| `/{username}` | ملف الخباز | عام (النشط فقط) |
| `/about`, `/join`, `/join/success` | ثابتة/شبه ثابتة | عام |
| `/edit?token=` | تعديل ذاتي | حامل الـ token |
| `/admin?secret=` | لوحة الإدارة | حامل الـ ADMIN_SECRET |

### API

| المسار | Method | التحقق |
|---|---|---|
| `/api/bakers/register` | POST | عام (ينشئ ملفاً غير نشط) |
| `/api/baker/edit` | PATCH | edit_token |
| `/api/upload` | POST | edit_token |
| `/api/admin/baker` | PATCH | ADMIN_SECRET |
| `/api/deploy` | GET | عام — فحص صحة (env + اتصال DB) |

## 5. نموذج الهوية والصلاحيات

لا حسابات ولا جلسات. ثلاث درجات وصول عبر أسرار حاملة (bearer secrets):

1. **الجمهور** — قراءة ما تسمح به RLS.
2. **الخباز** — `edit_token` (uuid) يُمنح عند التسجيل ويُرسل في كل طلب تعديل/رفع.
3. **الإدارة** — `ADMIN_SECRET` (env var) في query/body.

**مقايضة واعية:** البساطة مقابل قابلية تسريب الروابط. القبول مبرر لأن أسوأ ضرر هو تعديل ملف خباز واحد، والعلاج إعادة توليد الـ token. عند نمو المنصة، الترقية الطبيعية: OTP واتساب ← جلسات موقعة.

## 6. خط النشر (CI/CD)

```
push إلى main
   └─ GitHub Actions (appleboy/ssh-action)
        ├─ git reset --hard origin/main       (على الدروبلت)
        ├─ كتابة .env.local من GitHub Secrets  ← المصدر الوحيد للأسرار
        ├─ npm install && npm run build
        ├─ pm2 restart makhboz --update-env
        └─ فحص صحة: curl / (200؟) + /api/deploy (اتصال DB؟)
```

- **الأسرار في GitHub Secrets:** `DEPLOY_SSH_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`. ملف `.env.local` يُكتب في كل نشرة فلا يمكن أن "يضيع" على الخادم.
- **فحص الصحة بعد النشر** يكشف الانكسار فوراً في لوق الـ Action.

## 7. الأداء والتخزين المؤقت

- الصفحات الديناميكية `revalidate = 0` حالياً — الأولوية لصحة البيانات على السرعة، والحمل منخفض.
- **عند النمو:** رفع `revalidate` إلى 60 ثانية للرئيسية والملفات + `revalidatePath()` عند أي كتابة (تفعيل، تعديل) للجمع بين السرعة والطزاجة.
- الصور تُخدم من CDN Supabase Storage مباشرة.

## 8. المراقبة والتشخيص

- `/api/deploy` — فحص حي: وجود env vars + اختبار قراءة عامة وقراءة إدارية منفصلتين.
- لوقات التشغيل: `pm2 logs makhboz` على الدروبلت.
- لوقات قاعدة البيانات: Supabase Dashboard → Logs.
- **مقترح تالٍ:** Uptime check خارجي (DigitalOcean Uptime) على `/api/deploy` مع تنبيه.

## 9. خطة التوسع المرحلية

| المرحلة | المحفّز | التغيير |
|---|---|---|
| الحالية | ≤ 50 خباز | البنية الحالية تكفي بلا تغيير |
| 2 | بطء ملحوظ / آلاف الزيارات يومياً | تفعيل ISR + فهارس Postgres على (city, category) |
| 3 | تقييمات وتتبع نقرات | جداول `reviews` و`click_events` + تجميع دوري |
| 4 | فريق إدارة | جدول `admins` بأدوار بدل السر الواحد |
| 5 | ضغط على الدروبلت | فصل الواجهة إلى Vercel أو إضافة دروبلت خلف Load Balancer |

## 10. قرارات معمارية مسجلة (ADRs مختصرة)

1. **Next.js موحّد بدل واجهة+باك إند منفصلين** — فريق شخص واحد، سرعة تطوير أهم من فصل الاهتمامات.
2. **Tokens بدل حسابات** — التسجيل في دقيقتين شرط منتج؛ الأمان المطلوب متناسب مع حساسية البيانات (منخفضة).
3. **الطلب خارج المنصة (واتساب)** — يلغي كامل تعقيد المدفوعات والنزاعات، ويطابق سلوك الجمهور الحالي.
4. **دروبلت واحد بدل PaaS** — تكلفة ثابتة منخفضة وتحكم كامل؛ المقايضة: صيانة يدوية للخادم.
5. **anon للقراءة العامة دائماً** — عزل العطل: انكسار مفتاح service لا يسقط الموقع العام.
