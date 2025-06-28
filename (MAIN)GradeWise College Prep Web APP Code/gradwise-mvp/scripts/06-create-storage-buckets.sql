-- Create storage bucket for essay uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('essays', 'essays', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for essays bucket
CREATE POLICY "Users can upload own essays" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'essays' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own essays" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'essays' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own essays" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'essays' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
