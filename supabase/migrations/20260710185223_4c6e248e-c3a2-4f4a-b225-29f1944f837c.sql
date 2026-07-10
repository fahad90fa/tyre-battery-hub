CREATE POLICY "prof admin read" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role));