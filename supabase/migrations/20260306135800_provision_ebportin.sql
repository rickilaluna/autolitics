DO $$ 
DECLARE 
    v_user_id UUID;
    v_engagement_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ebportin@gmail.com' LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- 1. Ensure client record exists
        INSERT INTO public.clients (id, primary_email, primary_contact_name)
        VALUES (v_user_id, 'ebportin@gmail.com', 'Eb Portin')
        ON CONFLICT (id) DO NOTHING;

        -- 2. Ensure purchase record exists
        -- Attempt simple insert
        IF NOT EXISTS (SELECT 1 FROM public.purchases WHERE user_id = v_user_id AND product_type = 'advisory') THEN
            INSERT INTO public.purchases (user_id, stripe_session_id, product_type)
            VALUES (v_user_id, 'manual_prov_' || gen_random_uuid(), 'advisory');
        END IF;

    END IF;
END $$;
