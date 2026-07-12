
-- Merchants
CREATE TABLE public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  cnic text,
  opening_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchants TO authenticated;
GRANT ALL ON public.merchants TO service_role;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage merchants" ON public.merchants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  cnic text,
  opening_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  cnic text,
  position text,
  salary numeric NOT NULL DEFAULT 0,
  joining_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage employees" ON public.employees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Merchant ledger
CREATE TABLE public.merchant_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('credit','debit','purchase','payment')),
  amount numeric NOT NULL,
  reference text,
  note text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_ledger TO authenticated;
GRANT ALL ON public.merchant_ledger TO service_role;
ALTER TABLE public.merchant_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage merchant_ledger" ON public.merchant_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Client ledger
CREATE TABLE public.client_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('credit','debit','sale','payment')),
  amount numeric NOT NULL,
  reference text,
  note text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_ledger TO authenticated;
GRANT ALL ON public.client_ledger TO service_role;
ALTER TABLE public.client_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage client_ledger" ON public.client_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Templates
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  default_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage templates" ON public.templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Reports inbox (contact/support)
CREATE TABLE public.reports_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name text NOT NULL,
  from_email text,
  from_phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports_inbox TO authenticated;
GRANT INSERT ON public.reports_inbox TO anon;
GRANT ALL ON public.reports_inbox TO service_role;
ALTER TABLE public.reports_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.reports_inbox FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read inbox" ON public.reports_inbox FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update inbox" ON public.reports_inbox FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete inbox" ON public.reports_inbox FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_merchants_updated BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_inbox_updated BEFORE UPDATE ON public.reports_inbox FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mledger_updated BEFORE UPDATE ON public.merchant_ledger FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cledger_updated BEFORE UPDATE ON public.client_ledger FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Balance sync helpers
-- Merchant: credit/purchase INCREASES what we owe them; payment/debit DECREASES
CREATE OR REPLACE FUNCTION public.merchant_ledger_delta(_type text, _amount numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _type IN ('credit','purchase') THEN _amount ELSE -_amount END;
$$;

CREATE OR REPLACE FUNCTION public.merchant_ledger_sync()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.merchants SET current_balance = current_balance + public.merchant_ledger_delta(NEW.entry_type, NEW.amount) WHERE id = NEW.merchant_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.merchants SET current_balance = current_balance
      - public.merchant_ledger_delta(OLD.entry_type, OLD.amount)
      + public.merchant_ledger_delta(NEW.entry_type, NEW.amount)
      WHERE id = NEW.merchant_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.merchants SET current_balance = current_balance - public.merchant_ledger_delta(OLD.entry_type, OLD.amount) WHERE id = OLD.merchant_id;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_merchant_ledger_sync
AFTER INSERT OR UPDATE OR DELETE ON public.merchant_ledger
FOR EACH ROW EXECUTE FUNCTION public.merchant_ledger_sync();

-- Client: sale/debit INCREASES what they owe us; payment/credit DECREASES
CREATE OR REPLACE FUNCTION public.client_ledger_delta(_type text, _amount numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _type IN ('sale','debit') THEN _amount ELSE -_amount END;
$$;

CREATE OR REPLACE FUNCTION public.client_ledger_sync()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clients SET current_balance = current_balance + public.client_ledger_delta(NEW.entry_type, NEW.amount) WHERE id = NEW.client_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.clients SET current_balance = current_balance
      - public.client_ledger_delta(OLD.entry_type, OLD.amount)
      + public.client_ledger_delta(NEW.entry_type, NEW.amount)
      WHERE id = NEW.client_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clients SET current_balance = current_balance - public.client_ledger_delta(OLD.entry_type, OLD.amount) WHERE id = OLD.client_id;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_client_ledger_sync
AFTER INSERT OR UPDATE OR DELETE ON public.client_ledger
FOR EACH ROW EXECUTE FUNCTION public.client_ledger_sync();

-- Initialize current_balance from opening_balance on insert to merchants/clients
CREATE OR REPLACE FUNCTION public.init_balance()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.current_balance = 0 AND NEW.opening_balance <> 0 THEN
    NEW.current_balance := NEW.opening_balance;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_merchants_init BEFORE INSERT ON public.merchants FOR EACH ROW EXECUTE FUNCTION public.init_balance();
CREATE TRIGGER trg_clients_init BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.init_balance();
