{
  "crons": [
    {
      "path": "/api/sync-stripe",
      "schedule": "0 */6 * * *"
    }
  ],
  "functions": {
    "src/app/api/stripe/webhooks/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/sync-stripe/route.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key", 
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "@stripe_webhook_secret",
    "CRON_SECRET": "@cron_secret"
  }
}