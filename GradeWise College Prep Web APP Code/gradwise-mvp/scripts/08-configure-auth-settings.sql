-- Update auth configuration for proper email confirmation
-- Note: These settings should be configured in the Supabase Dashboard under Authentication > Settings

-- The following are the recommended settings for your Supabase project:
-- 1. Site URL: https://your-domain.com (or your Vercel deployment URL)
-- 2. Redirect URLs: 
--    - https://your-domain.com/auth/confirm
--    - https://your-domain.com/dashboard
--    - http://localhost:3000/auth/confirm (for development)
--    - http://localhost:3000/dashboard (for development)

-- Email template customization (configure in Dashboard > Authentication > Email Templates)
-- Subject: Confirm your email for GradWise
-- Body: 
-- <h2>Welcome to GradWise!</h2>
-- <p>Please click the link below to confirm your email address:</p>
-- <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
-- <p>If you didn't create an account with GradWise, you can safely ignore this email.</p>

-- For development, you can disable email confirmation temporarily:
-- Go to Authentication > Settings > Email Auth
-- Turn off "Enable email confirmations"
