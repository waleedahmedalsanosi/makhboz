# مخبوز — Makhboz

منصة اكتشاف خبازين سودانيين منزليين في السعودية. Next.js 16 + Supabase، تُنشر تلقائياً على makhboz.net عند كل push إلى `main`.

## المراجع
- المتطلبات: `docs/PRD.md`
- المعمارية: `docs/ARCHITECTURE.md`

## فريق الوكلاء (.claude/agents/)
للمهام متعددة الخطوات ابدأ بـ **munassiq** (المنسّق) وهو يوزع على:
- **wajiha** — الواجهة والمكونات (RTL/عربي)
- **qaidah** — قاعدة البيانات و RLS و API
- **fahis** — فحص الجودة والأمان (إلزامي قبل الدمج في main)
- **nashir** — النشر وتشخيص الإنتاج

## قواعد غير قابلة للتفاوض
1. عربي RTL، أرقام إنجليزية، `{price} ﷼`، خط Tajawal، ألوان عبر `--teal --cream --honey --ink --mist --border`.
2. inline styles فقط — لا Tailwind classes في المكونات.
3. مكوّن فيه handlers/hooks ⇒ `'use client'` (سبب عطل إنتاجي سابق).
4. قراءة عامة = `createServerClient()` (anon)، عمليات مميزة = `createAdminClient()`.
5. `searchParams`/`params` في Next 16 هي Promise — لازم `await`.
6. جدول جديد بدون RLS = ممنوع. تغييرات المخطط عبر `supabase/migrations/`.
7. الدمج في `main` = نشر فوري للإنتاج. لا تدفع قبل نجاح `npx next build` وفحص fahis.
8. لا أسرار في الكود — env vars فقط، وملف `.env.local` على الخادم يُكتب من GitHub Secrets في كل نشرة.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
