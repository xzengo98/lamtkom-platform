# Lamtkom Platform

منصة ألعاب جماعية مبنية بـ **Next.js + Supabase + Cloudflare**، وتضم عدة ألعاب جماعية موجهة للجلسات والتجمعات، مع لوحة إدارة للمحتوى والألعاب والمستخدمين.

---

## التقنيات المستخدمة

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
  - Auth
  - Database
  - RLS / Policies
- **Cloudflare**
  - OpenNext
  - Workers / Pages
- **PostCSS**

---

## الألعاب الحالية

### 1) لمتكم
لعبة أسئلة وأجوبة بين فريقين تعتمد على الفئات والنقاط.

### 2) برا السالفة
لعبة اجتماعية فيها لاعب لا يعرف الكلمة ويحاول اكتشافها من خلال الحوار.

### 3) Codenames
لعبة كلمات وتلميحات جماعية تعتمد على الفرق والأدوار.

---

## أهم المسارات داخل المشروع

```txt
src/
  app/
    admin/
    game/
    games/
    login/
    register/
    payment/
    pricing/
  components/
  lib/