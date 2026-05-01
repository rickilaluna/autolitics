-- Track whether Guide purchasers have completed the onboarding flow
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS guide_onboarding_completed boolean DEFAULT false;
