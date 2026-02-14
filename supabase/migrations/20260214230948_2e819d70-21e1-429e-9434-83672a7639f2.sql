-- Create trigger for logging funnel status changes (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_log_funnel_status_change'
  ) THEN
    CREATE TRIGGER trg_log_funnel_status_change
    AFTER UPDATE ON public.funnel_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.log_funnel_status_change();
  END IF;
END $$;