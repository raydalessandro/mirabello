-- ============================================
-- WindTre Mirabello - Supabase Schema
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. Tabella Contacts
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    privacy_accepted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT nome_min_length CHECK (char_length(nome) >= 2),
    CONSTRAINT cognome_min_length CHECK (char_length(cognome) >= 2),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT telefono_format CHECK (telefono ~* '^\+?[0-9]{9,15}$'),
    CONSTRAINT privacy_must_be_accepted CHECK (privacy_accepted = true)
);

-- ============================================
-- 2. Commenti tabella
-- ============================================
COMMENT ON TABLE public.contacts IS 'Richieste di contatto dalla landing page WindTre Mirabello';
COMMENT ON COLUMN public.contacts.nome IS 'Nome del richiedente';
COMMENT ON COLUMN public.contacts.cognome IS 'Cognome del richiedente';
COMMENT ON COLUMN public.contacts.telefono IS 'Numero di telefono (formato italiano)';
COMMENT ON COLUMN public.contacts.email IS 'Indirizzo email';
COMMENT ON COLUMN public.contacts.privacy_accepted IS 'Consenso privacy policy accettato';
COMMENT ON COLUMN public.contacts.created_at IS 'Data e ora della richiesta';
COMMENT ON COLUMN public.contacts.ip_address IS 'Indirizzo IP (se disponibile)';
COMMENT ON COLUMN public.contacts.user_agent IS 'User Agent del browser';

-- ============================================
-- 3. Indici per performance
-- ============================================
-- Indice per ordinamento cronologico (dashboard admin)
CREATE INDEX IF NOT EXISTS idx_contacts_created_at 
ON public.contacts(created_at DESC);

-- Indice per ricerca email (check duplicati)
CREATE INDEX IF NOT EXISTS idx_contacts_email 
ON public.contacts(email);

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================
-- Abilita RLS sulla tabella
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti (per idempotenza)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contacts;
DROP POLICY IF EXISTS "Deny all selects for anon" ON public.contacts;
DROP POLICY IF EXISTS "Deny all updates for anon" ON public.contacts;
DROP POLICY IF EXISTS "Deny all deletes for anon" ON public.contacts;
DROP POLICY IF EXISTS "Service role full access" ON public.contacts;

-- ============================================
-- 5. Policies RLS
-- ============================================

-- Policy: Permetti INSERT da utenti anonimi (landing page)
CREATE POLICY "Allow anonymous inserts" 
ON public.contacts
FOR INSERT 
TO anon
WITH CHECK (
    -- Verifica che tutti i campi obbligatori siano presenti
    nome IS NOT NULL 
    AND cognome IS NOT NULL 
    AND telefono IS NOT NULL 
    AND email IS NOT NULL 
    AND privacy_accepted = true
);

-- Policy: Service role ha accesso completo (per admin dashboard)
CREATE POLICY "Service role full access" 
ON public.contacts
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. Funzione per rate limiting (opzionale)
-- ============================================
-- Previene spam limitando le richieste per IP/email

CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(
    p_email VARCHAR,
    p_limit_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Conta richieste recenti dalla stessa email
    SELECT COUNT(*) INTO recent_count
    FROM public.contacts
    WHERE email = p_email
    AND created_at > NOW() - (p_limit_minutes || ' minutes')::INTERVAL;
    
    -- Permetti se meno di 3 richieste negli ultimi X minuti
    RETURN recent_count < 3;
END;
$$;

-- ============================================
-- 7. Trigger per validazione aggiuntiva (opzionale)
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_contact_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Normalizza email in lowercase
    NEW.email := LOWER(TRIM(NEW.email));
    
    -- Normalizza nome e cognome (prima lettera maiuscola)
    NEW.nome := INITCAP(TRIM(NEW.nome));
    NEW.cognome := INITCAP(TRIM(NEW.cognome));
    
    -- Rimuovi spazi dal telefono
    NEW.telefono := REGEXP_REPLACE(NEW.telefono, '\s', '', 'g');
    
    RETURN NEW;
END;
$$;

-- Crea trigger
DROP TRIGGER IF EXISTS trigger_validate_contact ON public.contacts;
CREATE TRIGGER trigger_validate_contact
    BEFORE INSERT ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_contact_insert();

-- ============================================
-- 8. Grant permissions
-- ============================================
-- Permessi per utente anonimo (solo INSERT)
GRANT INSERT ON public.contacts TO anon;

-- Permessi per service_role (accesso completo)
GRANT ALL ON public.contacts TO service_role;

-- ============================================
-- 9. Verifica setup
-- ============================================
-- Esegui questa query per verificare che tutto sia configurato correttamente:
/*
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'contacts';

-- Verifica policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'contacts';
*/

-- ============================================
-- ISTRUZIONI PER IL SETUP
-- ============================================
/*
1. Vai su https://supabase.com e crea un nuovo progetto
2. Vai su Dashboard > SQL Editor > New Query
3. Incolla tutto questo script e clicca "Run"
4. Vai su Dashboard > Settings > API
5. Copia "Project URL" e "anon public" key
6. Aggiorna js/main.js con le credenziali:
   - SUPABASE_URL = 'https://TUO_PROJECT_ID.supabase.co'
   - SUPABASE_ANON_KEY = 'TUA_ANON_KEY'

TEST:
- Vai su Dashboard > Table Editor > contacts
- La tabella dovrebbe essere vuota
- Compila il form sulla landing page
- Verifica che il contatto appaia nella tabella
*/

