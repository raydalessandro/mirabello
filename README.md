# WindTre Store Cantù Mirabello - Landing Page

Landing page per il WindTre Store di Cantù Mirabello con form di contatto integrato a Supabase.

## Struttura Progetto

```
windtre-mirabello/
├── index.html          # Landing page principale
├── privacy.html        # Privacy policy (GDPR)
├── cookie.html         # Cookie policy (GDPR)
├── css/
│   └── style.css       # Stili responsive
├── js/
│   ├── main.js         # Logica form + Supabase
│   └── cookie.js       # Cookie banner
├── supabase/
│   └── schema.sql      # Schema DB + RLS + Policies
├── tests/
│   └── e2e.spec.js     # Test E2E (Playwright)
└── playwright.config.js
```

## Setup

### 1. Configura Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Vai su **Dashboard > SQL Editor > New Query**
3. Copia e incolla il contenuto di `supabase/schema.sql`
4. Clicca **Run**

### 2. Configura Credenziali

1. Vai su **Dashboard > Settings > API**
2. Copia **Project URL** e **anon public key**
3. Modifica `js/main.js`:

```javascript
const SUPABASE_URL = 'https://TUO_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'TUA_ANON_KEY';
```

### 3. Deploy

Puoi deployare su qualsiasi hosting statico:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Avvia server locale
npm run serve

# Esegui test
npm test

# Test con UI
npm run test:ui
```

## Test

I test E2E verificano:
- ✅ Rendering pagina e contenuti
- ✅ Form di contatto con validazione
- ✅ Integrazione Supabase (mock)
- ✅ Cookie banner GDPR
- ✅ Link privacy/cookie policy
- ✅ Responsive design

## Sicurezza

### RLS (Row Level Security)

La tabella `contacts` ha RLS abilitato con policy che permettono:
- **INSERT** solo da utenti anonimi
- **SELECT/UPDATE/DELETE** solo per service_role (admin)

### Validazione

- Validazione client-side nel form
- Validazione server-side tramite CHECK constraints in PostgreSQL
- Rate limiting opzionale tramite funzione SQL

## GDPR Compliance

- ✅ Cookie banner con consenso
- ✅ Privacy Policy completa
- ✅ Cookie Policy
- ✅ Consenso esplicito nel form
- ✅ Solo cookie tecnici necessari

