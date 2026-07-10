CREATE TABLE public.customer_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity_purchased int NOT NULL,
  total_price numeric(12,2) NOT NULL,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL CHECK (payment_method IN ('cash','debit')),
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid','unpaid')),
  payment_due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_purchases TO authenticated;
GRANT ALL ON public.customer_purchases TO service_role;
ALTER TABLE public.customer_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp own read" ON public.customer_purchases FOR SELECT TO authenticated
  USING ((select auth.uid()) = customer_id);
CREATE POLICY "cp admin" ON public.customer_purchases FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::public.app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::public.app_role));