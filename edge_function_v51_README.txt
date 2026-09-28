// JASNAL v51 admin-signup-push Edge Function skeleton
// Server-side only. Do NOT place service-role or VAPID private key in index.html.
// This function is intended to be invoked by a Database Webhook or scheduled worker
// after a row is inserted into public.admin_notifications.
//
// Required Supabase secrets:
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// VAPID_PUBLIC_KEY
// VAPID_PRIVATE_KEY
// VAPID_SUBJECT
//
// NOTE: Your earlier project had a VAPID private-key decoding error.
// Deploy only after the VAPID key pair is valid. The browser client/SQL are ready
// to queue signup_request events and store administrator opt-in settings.
