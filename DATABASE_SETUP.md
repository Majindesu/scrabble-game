# PostgreSQL Migration Guide

## Option 1: Local PostgreSQL with Docker
If you want to run PostgreSQL locally, make sure Docker is installed and running, then:

```bash
docker-compose up -d
```

## Option 2: Cloud PostgreSQL (Recommended for Development)

### Neon (Free PostgreSQL in the cloud)
1. Go to https://neon.tech/
2. Sign up for a free account
3. Create a new database project
4. Copy the connection string
5. Update your .env file with the connection string

### Other alternatives:
- Supabase (https://supabase.com/) - Free tier with additional features
- Railway (https://railway.app/) - Simple deployment
- Vercel Postgres (https://vercel.com/docs/storage/vercel-postgres)

## Option 3: Local PostgreSQL Installation
If you prefer to install PostgreSQL directly on your system:

### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
createdb scrabble_dev
```

Then update your DATABASE_URL to:
```
DATABASE_URL="postgresql://[your-username]@localhost:5432/scrabble_dev"
```

## Next Steps After Database Setup:
1. Generate and run migrations:
   ```bash
   npm run drizzle:generate
   npm run drizzle:migrate
   ```

2. Test the connection:
   ```bash
   npm run dev
   ```
