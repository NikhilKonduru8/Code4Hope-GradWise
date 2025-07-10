-- Verify essays table exists and has correct structure
-- Run this to check if the table needs to be created or fixed

-- Check if essays table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'essays'
) as table_exists;

-- If table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'essays' 
ORDER BY ordinal_position;

-- Check RLS policies for essays
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'essays';

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  file_name TEXT,
  file_path TEXT,
  ai_feedback TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'essays' 
        AND policyname = 'Users can view own essays'
    ) THEN
        CREATE POLICY "Users can view own essays" ON essays
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'essays' 
        AND policyname = 'Users can manage own essays'
    ) THEN
        CREATE POLICY "Users can manage own essays" ON essays
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);

SELECT 'essays table verification complete' as status;
