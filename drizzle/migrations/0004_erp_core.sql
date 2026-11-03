
CREATE TABLE public.suppliers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text, notes text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text, notes text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.warehouses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, location text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.stock (product_id text NOT NULL, warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE, qty integer NOT NULL DEFAULT 0, barcode text, PRIMARY KEY (product_id, warehouse_id));
CREATE TABLE public.stock_movements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id text NOT NULL, warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE, qty_change integer NOT NULL, reason text NOT NULL, ref uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.purchases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), supplier_id uuid NOT NULL REFERENCES public.suppliers(id), warehouse_id uuid NOT NULL REFERENCES public.warehouses(id), product_id text NOT NULL, qty integer NOT NULL CHECK (qty > 0), unit_cost_sar numeric NOT NULL CHECK (unit_cost_sar >= 0), total_sar numeric GENERATED ALWAYS AS (qty * unit_cost_sar) STORED, paid_sar numeric NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES public.customers(id), warehouse_id uuid NOT NULL REFERENCES public.warehouses(id), product_id text NOT NULL, qty integer NOT NULL CHECK (qty > 0), unit_price_sar numeric NOT NULL CHECK (unit_price_sar >= 0), unit_cost_sar numeric NOT NULL DEFAULT 0, total_sar numeric GENERATED ALWAYS AS (qty * unit_price_sar) STORED, paid_sar numeric NOT NULL DEFAULT 0, channel text NOT NULL DEFAULT 'pos', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.payments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), party_type text NOT NULL CHECK (party_type IN ('customer','supplier')), party_id uuid NOT NULL, amount_sar numeric NOT NULL CHECK (amount_sar > 0), memo text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.ledger (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account text NOT NULL, debit_sar numeric NOT NULL DEFAULT 0, credit_sar numeric NOT NULL DEFAULT 0, memo text, ref uuid, created_at timestamptz NOT NULL DEFAULT now());

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['suppliers','customers','warehouses','stock','stock_movements','purchases','sales','payments','ledger'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Admins manage %s" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t, t);
  END LOOP;
END $$;

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.erp_move_stock(_product text, _wh uuid, _delta integer, _reason text, _ref uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cur integer;
BEGIN
  INSERT INTO stock(product_id, warehouse_id, qty) VALUES (_product, _wh, 0) ON CONFLICT DO NOTHING;
  SELECT qty INTO cur FROM stock WHERE product_id = _product AND warehouse_id = _wh FOR UPDATE;
  IF cur + _delta < 0 THEN RAISE EXCEPTION 'المخزون غير كافٍ: المتوفر %', cur; END IF;
  UPDATE stock SET qty = qty + _delta WHERE product_id = _product AND warehouse_id = _wh;
  INSERT INTO stock_movements(product_id, warehouse_id, qty_change, reason, ref) VALUES (_product, _wh, _delta, _reason, _ref);
END $$;
REVOKE EXECUTE ON FUNCTION public.erp_move_stock(text, uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.erp_on_purchase() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM erp_move_stock(NEW.product_id, NEW.warehouse_id, NEW.qty, 'purchase', NEW.id);
  INSERT INTO ledger(account, debit_sar, credit_sar, memo, ref) VALUES
    ('المخزون', NEW.total_sar, 0, 'شراء ' || NEW.product_id, NEW.id),
    ('الصندوق', 0, NEW.paid_sar, 'دفع للمورد', NEW.id),
    ('ذمم الموردين', 0, NEW.total_sar - NEW.paid_sar, 'آجل للمورد', NEW.id);
  RETURN NEW;
END $$;
CREATE TRIGGER purchases_stock AFTER INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.erp_on_purchase();

CREATE OR REPLACE FUNCTION public.erp_before_sale() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT COALESCE(SUM(total_sar) / NULLIF(SUM(qty),0), 0) INTO NEW.unit_cost_sar FROM purchases WHERE product_id = NEW.product_id;
  IF NEW.paid_sar > NEW.qty * NEW.unit_price_sar THEN RAISE EXCEPTION 'المدفوع أكبر من الإجمالي'; END IF;
  IF NEW.customer_id IS NULL AND NEW.paid_sar < NEW.qty * NEW.unit_price_sar THEN RAISE EXCEPTION 'البيع الآجل يتطلب اختيار عميل'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER sales_cost BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.erp_before_sale();

CREATE OR REPLACE FUNCTION public.erp_on_sale() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM erp_move_stock(NEW.product_id, NEW.warehouse_id, -NEW.qty, 'sale', NEW.id);
  INSERT INTO ledger(account, debit_sar, credit_sar, memo, ref) VALUES
    ('الصندوق', NEW.paid_sar, 0, 'تحصيل بيع', NEW.id),
    ('ذمم العملاء', NEW.total_sar - NEW.paid_sar, 0, 'بيع آجل', NEW.id),
    ('المبيعات', 0, NEW.total_sar, 'بيع ' || NEW.product_id, NEW.id),
    ('تكلفة المبيعات', NEW.qty * NEW.unit_cost_sar, 0, 'تكلفة', NEW.id),
    ('المخزون', 0, NEW.qty * NEW.unit_cost_sar, 'خروج مخزون', NEW.id);
  RETURN NEW;
END $$;
CREATE TRIGGER sales_stock AFTER INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.erp_on_sale();

CREATE OR REPLACE FUNCTION public.erp_on_payment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.party_type = 'customer' THEN
    INSERT INTO ledger(account, debit_sar, credit_sar, memo, ref) VALUES ('الصندوق', NEW.amount_sar, 0, 'سداد عميل', NEW.id), ('ذمم العملاء', 0, NEW.amount_sar, 'سداد عميل', NEW.id);
  ELSE
    INSERT INTO ledger(account, debit_sar, credit_sar, memo, ref) VALUES ('ذمم الموردين', NEW.amount_sar, 0, 'سداد مورد', NEW.id), ('الصندوق', 0, NEW.amount_sar, 'سداد مورد', NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER payments_ledger AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.erp_on_payment();

CREATE OR REPLACE FUNCTION public.erp_stocktake(_product text, _wh uuid, _counted integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cur integer;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF _counted < 0 THEN RAISE EXCEPTION 'عدد غير صالح'; END IF;
  SELECT COALESCE((SELECT qty FROM stock WHERE product_id=_product AND warehouse_id=_wh),0) INTO cur;
  IF _counted <> cur THEN PERFORM erp_move_stock(_product, _wh, _counted - cur, 'stocktake', NULL); END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.erp_stocktake(text, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.erp_stocktake(text, uuid, integer) TO authenticated;

INSERT INTO public.warehouses(name, location) VALUES ('المستودع الرئيسي', 'صنعاء');
