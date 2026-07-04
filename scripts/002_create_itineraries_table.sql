-- Create itineraries table
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_total DECIMAL(10,2),
  budget_spent DECIMAL(10,2) DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  itinerary_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "itineraries_select_own"
  ON public.itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "itineraries_insert_own"
  ON public.itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "itineraries_update_own"
  ON public.itineraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "itineraries_delete_own"
  ON public.itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at DESC);
