# Supabase Setup

## Option 1: Run via Supabase Dashboard (easiest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **SQL Editor** → **New query**
3. Copy the contents of `migrations/20250302000000_seed_ticket_schema.sql`
4. Paste and click **Run**

## Option 2: Run via Supabase CLI

If you have the Supabase CLI linked to your project:

```bash
supabase db push
```

Or run the migration file directly:

```bash
supabase db execute -f supabase/migrations/20250302000000_seed_ticket_schema.sql
```

## What it creates

- **ticket_types** – Adult, Child, Student, Senior (with prices)
- **time_slots** – 2 weeks of morning/afternoon slots for scheduled entry
- **orders**, **order_items**, **tickets**, **visits** – checkout and ticket flow tables
- RLS policies for public read on ticket types/slots, and user-scoped access for orders, tickets, visits
