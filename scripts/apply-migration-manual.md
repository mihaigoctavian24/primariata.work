# Apply Dashboard Migration - Manual Steps

**Quick Guide pentru aplicarea migrației prin Supabase Dashboard**

## Pași Rapidi (2 minute)

### 1. Deschide Supabase Dashboard

```
https://supabase.com/dashboard/project/ihwfqsongyaahdtypgnh/sql/new
```

### 2. Copiază SQL-ul migrației

**Fișier:** `supabase/migrations/20260109003629_dashboard_revamp_tables.sql`

```bash
# Macă copiază tot conținutul fișierului (327 linii)
cat supabase/migrations/20260109003629_dashboard_revamp_tables.sql | pbcopy
```

### 3. Lipește în SQL Editor și Execută

1. Paste SQL-ul (Cmd+V)
2. Click "Run" (sau Cmd+Enter)
3. Așteaptă confirmarea (5-10 secunde)

### 4. Verifică că a funcționat

```bash
npx tsx scripts/check-dashboard-tables.ts
```

**Rezultat așteptat:**

```
✅ notifications table EXISTS
✅ user_achievements table EXISTS
✅ progress_data column EXISTS in cereri
```

---

## Alternative: CLI

Dacă ai parola database:

```bash
export SUPABASE_DB_PASSWORD="your_password"
npx supabase db push --linked
```

---

## Ce se creează

- ✅ `notifications` table (9 columns, 4 indexes, 4 RLS policies)
- ✅ `user_achievements` table (7 columns, 3 indexes, 2 RLS policies)
- ✅ `progress_data` column în `cereri` (JSONB, 1 index)
- ✅ 3 helper functions (calculate_progress, expire_notifications, notify_status_change)
- ✅ 1 trigger (auto-notifications pe cereri status change)

---

**Total timp:** 2-5 minute
**Link direct:** https://supabase.com/dashboard/project/ihwfqsongyaahdtypgnh/sql/new
