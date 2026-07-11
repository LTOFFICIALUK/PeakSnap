#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "prod-ship: $*" >&2
  exit 1
}

if [[ ! -f .env ]]; then
  fail "Missing .env — copy .env.example and add Neon pooled + direct URLs."
fi

# shellcheck disable=SC1091
source <(grep -E '^(DATABASE_URL|DIRECT_URL|ADMIN_SECRET)=' .env | sed 's/^/export /')

if [[ -z "${DATABASE_URL:-}" ]] || [[ "${DATABASE_URL}" == file:* ]]; then
  fail "DATABASE_URL must be a Neon pooled postgresql URL (not SQLite)."
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  fail "DIRECT_URL must be set to your Neon direct postgresql URL."
fi

if [[ "${DATABASE_URL}" != postgresql://* ]] && [[ "${DATABASE_URL}" != postgres://* ]]; then
  fail "DATABASE_URL must start with postgresql://"
fi

if [[ "${DIRECT_URL}" != postgresql://* ]] && [[ "${DIRECT_URL}" != postgres://* ]]; then
  fail "DIRECT_URL must start with postgresql://"
fi

echo "→ prisma migrate deploy"
npx prisma migrate deploy

echo "→ deck:live (build today's deck from your PC)"
npm run deck:live

echo "✓ Prod DB ready — push code to trigger Vercel deploy."
