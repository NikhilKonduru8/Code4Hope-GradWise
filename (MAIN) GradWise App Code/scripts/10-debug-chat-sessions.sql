-- Debug script to check chat_sessions table and permissions
-- Run this to verify the table exists and has proper permissions

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'chat_sessions'
);

-- Check table structure
\d chat_sessions;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_sessions';

-- Test insert (replace with actual user ID)
-- INSERT INTO chat_sessions (user_id, session_id, message_type, content) 
-- VALUES ('your-user-id-here', 'test-session', 'user', 'test message');

-- Check if there are any existing chat sessions
SELECT COUNT(*) as total_sessions FROM chat_sessions;

-- Check recent sessions
SELECT user_id, session_id, message_type, content, timestamp 
FROM chat_sessions 
ORDER BY timestamp DESC 
LIMIT 10;
