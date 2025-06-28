-- Create college_recommendations table to store AI recommendations
CREATE TABLE IF NOT EXISTS college_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  income_bracket TEXT NOT NULL,
  recommendations TEXT, -- AI-generated recommendations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE college_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own recommendations" ON college_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recommendations" ON college_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_college_recommendations_user_id ON college_recommendations(user_id);
