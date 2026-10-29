# Halı Saha

Arkadaş grubu için küçük bir maç planlama sitesi.

- Herkes ad, soyad ve e-postasıyla kaydolur.
- Önümüzdeki 30 günde müsait olduğu günleri işaretler.
- Üyeler her gün için sadece kaç kişinin müsait olduğunu görür; isimleri adminler görür.
- Adminler en kalabalık güne maçı (gün, saat, saha, adres) koyar, herkes ana sayfada görür.
- Kurucu, kaydolanlardan istediğini admin yapar.

## Teknoloji

Next.js 16 (App Router), Tailwind CSS 4, Supabase (Auth + Postgres, RLS), Vercel.

## Yerelde çalıştırma

```bash
cp .env.example .env.local   # Supabase URL ve publishable key
npm install
npm run dev
```

Veritabanı şeması: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

Kurucu rolü uygulamadan verilmez; ilk kayıttan sonra Supabase SQL editöründe bir kez atanır:

```sql
update public.profiles set role = 'owner' where email = '<kurucunun e-postası>';
```
