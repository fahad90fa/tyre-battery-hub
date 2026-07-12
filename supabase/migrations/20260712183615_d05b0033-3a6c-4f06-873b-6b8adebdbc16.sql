
ALTER FUNCTION public.merchant_ledger_delta(text, numeric) SET search_path = public;
ALTER FUNCTION public.client_ledger_delta(text, numeric) SET search_path = public;

DROP POLICY "Anyone can submit contact messages" ON public.reports_inbox;
CREATE POLICY "Anyone can submit contact messages" ON public.reports_inbox
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(trim(from_name)) > 0 AND length(trim(message)) > 0 AND status = 'new');
