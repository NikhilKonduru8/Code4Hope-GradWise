-- Create college_recommendations table to store AI recommendations
-- Fixed version with proper column names and error handling

-- Drop table if it exists to recreate with correct structure
DROP TABLE IF EXISTS college_recommendations CASCADE;

-- Create college_recommendations table
CREATE TABLE college_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  income_bracket TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE college_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own recommendations" ON college_recommendations;
DROP POLICY IF EXISTS "Users can manage own recommendations" ON college_recommendations;

-- Create policies
CREATE POLICY "Users can view own recommendations" ON college_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON college_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON college_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON college_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_college_recommendations_user_id ON college_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_college_recommendations_created_at ON college_recommendations(created_at);

-- Verify table creation with proper SQL
SELECT 'college_recommendations table setup complete' as status;

-- Show table structure using proper SQL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'college_recommendations' 
ORDER BY ordinal_position;
