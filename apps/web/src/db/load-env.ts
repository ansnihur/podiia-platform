// Load apps/web/.env for CLI scripts (Next.js loads it by itself). Missing file is fine.
try {
  process.loadEnvFile('.env');
} catch {}
