# envguard

> Lightweight library to validate and document environment variables at app startup

---

## Installation

```bash
npm install envguard
# or
yarn add envguard
```

---

## Usage

```typescript
import { createEnvGuard, z } from 'envguard';

const env = createEnvGuard({
  PORT: {
    schema: z.string().regex(/^\d+$/),
    description: 'Port the server will listen on',
    default: '3000',
  },
  DATABASE_URL: {
    schema: z.string().url(),
    description: 'PostgreSQL connection string',
  },
  NODE_ENV: {
    schema: z.enum(['development', 'production', 'test']),
    description: 'Application environment',
  },
});

// Throws at startup if any required variable is missing or invalid
console.log(env.PORT);        // '3000'
console.log(env.DATABASE_URL); // 'postgres://...'
```

If validation fails, **envguard** exits early with a clear, readable error message listing every missing or invalid variable — no more cryptic runtime crashes.

---

## Features

- ✅ Validates env variables at startup, not at runtime
- 📄 Self-documents variables with descriptions
- 🔒 Fully typed — access variables with autocomplete
- 🪶 Zero heavy dependencies

---

## License

[MIT](./LICENSE)