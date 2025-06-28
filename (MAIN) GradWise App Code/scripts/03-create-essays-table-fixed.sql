-- Create essays table to store uploaded essays and feedback
-- This is a fixed version that ensures the table is created properly

-- Drop table if it exists to recreate with correct structure
DROP TABLE IF EXISTS essays CASCADE;

-- Create essays table
CREATE TABLE essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  file_name TEXT,
  file_path TEXT,
  ai_feedback TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own essays" ON essays;
DROP POLICY IF EXISTS "Users can manage own essays" ON essays;

-- Create policies
CREATE POLICY "Users can view own essays" ON essays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own essays" ON essays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own essays" ON essays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own essays" ON essays
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
CREATE INDEX IF NOT EXISTS idx_essays_created_at ON essays(created_at);

-- Verify table creation
SELECT 'essays table setup complete' as status;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'essays' 
ORDER BY ordinal_position;
