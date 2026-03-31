-- Merge duplicate rows in public.clients that share the same primary_email (case-insensitive).
-- Reassigns FKs to the survivor row (latest updated_at), then deletes duplicates.
-- Adds a partial unique index so new duplicates cannot be inserted.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'clients' AND n.nspname = 'public'
    ) THEN
        -- 1) Survivor = one row per normalized email (prefer most recently updated).
        CREATE TEMP TABLE _client_dedupe_survivors ON COMMIT DROP AS
        SELECT DISTINCT ON (lower(trim(primary_email)))
            id AS survivor_id,
            lower(trim(primary_email)) AS em
        FROM public.clients
        WHERE primary_email IS NOT NULL AND trim(primary_email) <> ''
        ORDER BY lower(trim(primary_email)), updated_at DESC NULLS LAST, created_at DESC NULLS LAST;

        CREATE TEMP TABLE _client_dedupe_drop ON COMMIT DROP AS
        SELECT c.id AS drop_id, s.survivor_id
        FROM public.clients c
        JOIN _client_dedupe_survivors s ON s.em = lower(trim(c.primary_email))
        WHERE c.id <> s.survivor_id
          AND primary_email IS NOT NULL AND trim(primary_email) <> '';

        -- 2) Repoint child tables (only if tables exist).
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engagements') THEN
            UPDATE public.engagements e
            SET client_id = d.survivor_id, updated_at = COALESCE(e.updated_at, NOW())
            FROM _client_dedupe_drop d
            WHERE e.client_id = d.drop_id;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_reviews') THEN
            UPDATE public.listing_reviews lr
            SET client_id = d.survivor_id, updated_at = lr.updated_at
            FROM _client_dedupe_drop d
            WHERE lr.client_id = d.drop_id;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_drive_feedback') THEN
            UPDATE public.test_drive_feedback t
            SET client_id = d.survivor_id, updated_at = t.updated_at
            FROM _client_dedupe_drop d
            WHERE t.client_id = d.drop_id;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dealer_offer_reviews') THEN
            UPDATE public.dealer_offer_reviews o
            SET client_id = d.survivor_id, updated_at = o.updated_at
            FROM _client_dedupe_drop d
            WHERE o.client_id = d.drop_id;
        END IF;

        -- 3) Delete duplicate client rows (survivor keeps latest updated_at).
        DELETE FROM public.clients c
        USING _client_dedupe_drop d
        WHERE c.id = d.drop_id;
    END IF;
END $$;

-- One row per non-empty email (case-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS clients_primary_email_lower_unique
    ON public.clients (lower(trim(primary_email)))
    WHERE primary_email IS NOT NULL AND trim(primary_email) <> '';
