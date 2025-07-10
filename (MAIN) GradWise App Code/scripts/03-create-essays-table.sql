-- Create essays table to store uploaded essays and feedback
CREATE TABLE IF NOT EXISTS essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  file_name TEXT,
  file_path TEXT,
  ai_feedback TEXT,
  status TEXT DEFAULT 'uploaded', -- 'uploaded', 'processing', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own essays" ON essays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own essays" ON essays
  FOR ALL USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
