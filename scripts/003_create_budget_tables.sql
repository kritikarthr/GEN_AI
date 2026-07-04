-- Create budget categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('accommodation', 'food', 'transportation', 'activities', 'shopping', 'miscellaneous')),
  allocated_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('accommodation', 'food', 'transportation', 'activities', 'shopping', 'miscellaneous')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_categories
CREATE POLICY "budget_categories_select_own"
  ON public.budget_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = budget_categories.itinerary_id 
    AND itineraries.user_id = auth.uid()
  ));

CREATE POLICY "budget_categories_insert_own"
  ON public.budget_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = budget_categories.itinerary_id 
    AND itineraries.user_id = auth.uid()
  ));

CREATE POLICY "budget_categories_update_own"
  ON public.budget_categories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.itineraries 
    WHERE itineraries.id = budget_categories.itinerary_id 
    AND itineraries.user_id = auth.uid()
  ));

-- Create RLS policies for expenses
CREATE POLICY "expenses_select_own"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_categories_itinerary_id ON public.budget_categories(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_expenses_itinerary_id ON public.expenses(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
