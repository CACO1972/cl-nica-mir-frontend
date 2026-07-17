
-- Drop overly permissive public policies
DROP POLICY IF EXISTS "Service can manage analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Service can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Service can manage consents" ON public.consents;
DROP POLICY IF EXISTS "Service can manage payments" ON public.funnel_payments;
DROP POLICY IF EXISTS "Service can manage history" ON public.funnel_status_history;
DROP POLICY IF EXISTS "Service can manage notifications" ON public.notifications_log;
DROP POLICY IF EXISTS "Service can manage scheduling_preferences" ON public.patient_scheduling_preferences;
DROP POLICY IF EXISTS "Service can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service can manage second_opinions" ON public.second_opinions;
DROP POLICY IF EXISTS "Service can manage waitlist" ON public.waitlist;

-- Owner-scoped read policies for authenticated users
CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduling preferences"
  ON public.patient_scheduling_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own waitlist entries"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own second_opinions"
  ON public.second_opinions FOR SELECT
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Storage: remove public read + public upload on intake-files
DROP POLICY IF EXISTS "Anyone can upload intake files" ON storage.objects;
DROP POLICY IF EXISTS "Service can read intake files" ON storage.objects;

-- Restrict SECURITY DEFINER function - called from auth trigger, not directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_funnel_status_change() FROM anon, authenticated, PUBLIC;
