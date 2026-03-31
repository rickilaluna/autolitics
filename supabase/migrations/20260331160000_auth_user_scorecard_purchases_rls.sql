-- Link public.clients to auth.users for admin tooling; cloud scorecard per user; purchases RLS + admin read.

-- ---------------------------------------------------------------------------
-- purchases (Stripe webhook / manual inserts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    stripe_session_id TEXT,
    product_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases (user_id);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchases_select_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_select_admin" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_all_authenticated" ON public.purchases;

CREATE POLICY "purchases_select_own"
    ON public.purchases FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "purchases_select_admin"
    ON public.purchases FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'email') = 'rickilaluna@gmail.com'
        OR (auth.jwt() ->> 'email') ILIKE '%@autolitics.com'
    );

-- Inserts typically come from service role (webhook); allow authenticated self-insert for tests/manual
CREATE POLICY "purchases_insert_own"
    ON public.purchases FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- clients.auth_user_id — join to purchases / scorecard
-- ---------------------------------------------------------------------------
ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS clients_auth_user_id_unique
    ON public.clients (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

UPDATE public.clients c
SET auth_user_id = u.id
FROM auth.users u
WHERE c.auth_user_id IS NULL
  AND c.primary_email IS NOT NULL
  AND trim(c.primary_email) <> ''
  AND lower(trim(c.primary_email)) = lower(u.email::text);

-- ---------------------------------------------------------------------------
-- Vehicle scorecard JSON (synced from /resources/scorecard)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_scorecard_snapshots (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.client_scorecard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scorecard_snapshots_own" ON public.client_scorecard_snapshots;

CREATE POLICY "scorecard_snapshots_own"
    ON public.client_scorecard_snapshots FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
