# EventHive

EventHive is an event discovery and organizer workflow app with attendee/organizer dashboards and authentication (email/password + Google sign-in).

## Testing

### Setup

```bash
pnpm install
```

Create `./.env.local`:

```bash
JWT_SECRET=replace-with-a-long-random-secret
SQLITE_DB_PATH=./eventhive.db

# Optional (enables Google sign-in)
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
```

If you enable Google sign-in, add this redirect URL in Google Cloud Console:

```bash
http://localhost:3000/api/auth/google/callback
```

### Run locally (manual testing)

```bash
pnpm dev
```

### Checks

```bash
pnpm lint
pnpm build
```
