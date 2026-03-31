-- Intro call bookings from public /book form (anon insert) + merge into clients on first login.
-- Advisory service milestones (set by admin in dashboard).

CREATE TABLE IF NOT EXISTS public.intro_call_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intro_call_bookings_email_lower ON public.intro_call_bookings (lower(email));

ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS intro_availability_jsonb JSONB,
    ADD COLUMN IF NOT EXISTS intro_booking_snapshot_jsonb JSONB,
    ADD COLUMN IF NOT EXISTS advisory_intro_call_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS advisory_discovery_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS advisory_strategy_brief_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS advisory_negotiation_support_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS advisory_engagement_completed_at TIMESTAMPTZ;

ALTER TABLE public.intro_call_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intro_bookings_anon_insert" ON public.intro_call_bookings;
CREATE POLICY "intro_bookings_anon_insert"
    ON public.intro_call_bookings
    FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "intro_bookings_authenticated_insert" ON public.intro_call_bookings;
CREATE POLICY "intro_bookings_authenticated_insert"
    ON public.intro_call_bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT INSERT ON public.intro_call_bookings TO anon;
GRANT INSERT ON public.intro_call_bookings TO authenticated;

-- Merge /book payload into clients for the logged-in user's email; removes pending booking row.
CREATE OR REPLACE FUNCTION public.merge_intro_call_booking()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
    v_form JSONB;
    v_budget JSONB;
    v_client_id UUID;
    v_min INTEGER;
    v_max INTEGER;
    v_nu TEXT;
    v_types TEXT;
    v_pts TEXT;
    v_notes_extra TEXT;
BEGIN
    SELECT lower(trim(u.email)) INTO v_email FROM auth.users u WHERE u.id = auth.uid();
    IF v_email IS NULL OR v_email = '' THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'no_email');
    END IF;

    SELECT ib.form_data INTO v_form
    FROM public.intro_call_bookings ib
    WHERE lower(ib.email) = v_email
    ORDER BY ib.created_at DESC
    LIMIT 1;

    IF v_form IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'no_pending_booking');
    END IF;

    v_budget := v_form -> 'budget';
    IF jsonb_typeof(v_budget) = 'array' AND jsonb_array_length(v_budget) >= 2 THEN
        v_min := (v_budget ->> 0)::INTEGER * 1000;
        v_max := (v_budget ->> 1)::INTEGER * 1000;
    END IF;

    v_nu := NULLIF(trim(COALESCE(v_form ->> 'considering', '')), '');
    IF v_nu IS NOT NULL THEN
        v_nu := lower(v_nu);
        IF v_nu = 'not sure' THEN
            v_nu := NULL;
        ELSIF v_nu = 'new' THEN
            v_nu := 'new';
        ELSIF v_nu = 'used' THEN
            v_nu := 'used';
        END IF;
    END IF;

    IF jsonb_typeof(v_form -> 'vehicleTypes') = 'array' THEN
        SELECT string_agg(x, ', ')
        INTO v_types
        FROM jsonb_array_elements_text(v_form -> 'vehicleTypes') AS t(x);
    END IF;

    IF jsonb_typeof(v_form -> 'powertrains') = 'array' THEN
        SELECT string_agg(x, ', ')
        INTO v_pts
        FROM jsonb_array_elements_text(v_form -> 'powertrains') AS t(x);
    END IF;

    v_notes_extra := trim(concat_ws(
        E'\n',
        NULLIF(trim(COALESCE(v_form ->> 'size', '')), '')::text,
        CASE
            WHEN v_types IS NOT NULL THEN 'Vehicle types: ' || v_types
            ELSE NULL
        END,
        CASE
            WHEN v_pts IS NOT NULL THEN 'Powertrains: ' || v_pts
            ELSE NULL
        END
    ));

    SELECT c.id INTO v_client_id FROM public.clients c WHERE lower(c.primary_email) = v_email LIMIT 1;

    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (
            primary_contact_name,
            primary_email,
            buying_timeline,
            primary_goal,
            new_or_used,
            budget_min,
            budget_max,
            body_style_preference,
            household_notes,
            intro_availability_jsonb,
            intro_booking_snapshot_jsonb
        )
        VALUES (
            COALESCE(NULLIF(trim(v_form ->> 'name'), ''), 'Client'),
            v_email,
            NULLIF(trim(v_form ->> 'timeline'), ''),
            NULLIF(trim(v_form ->> 'helpText'), ''),
            v_nu,
            v_min,
            v_max,
            NULLIF(trim(v_types), ''),
            NULLIF(v_notes_extra, ''),
            v_form -> 'availability',
            v_form
        )
        RETURNING id INTO v_client_id;
    ELSE
        UPDATE public.clients
        SET
            primary_contact_name = COALESCE(NULLIF(trim(v_form ->> 'name'), ''), primary_contact_name),
            buying_timeline = COALESCE(NULLIF(trim(v_form ->> 'timeline'), ''), buying_timeline),
            primary_goal = COALESCE(NULLIF(trim(v_form ->> 'helpText'), ''), primary_goal),
            new_or_used = COALESCE(v_nu, new_or_used),
            budget_min = COALESCE(v_min, budget_min),
            budget_max = COALESCE(v_max, budget_max),
            body_style_preference = COALESCE(NULLIF(trim(v_types), ''), body_style_preference),
            household_notes = CASE
                WHEN v_notes_extra IS NULL OR v_notes_extra = '' THEN household_notes
                WHEN household_notes IS NULL OR trim(household_notes) = '' THEN v_notes_extra
                WHEN strpos(COALESCE(household_notes, ''), v_notes_extra) > 0 THEN household_notes
                ELSE trim(household_notes || E'\n\n' || 'Intro call notes: ' || v_notes_extra)
            END,
            intro_availability_jsonb = COALESCE(v_form -> 'availability', intro_availability_jsonb),
            intro_booking_snapshot_jsonb = COALESCE(v_form, intro_booking_snapshot_jsonb),
            updated_at = NOW()
        WHERE id = v_client_id;
    END IF;

    DELETE FROM public.intro_call_bookings WHERE lower(email) = v_email;

    RETURN jsonb_build_object('ok', true, 'client_id', v_client_id);
END;
$$;

REVOKE ALL ON FUNCTION public.merge_intro_call_booking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_intro_call_booking() TO authenticated;
