/**
 * WindTre Mirabello - Form Handler
 * Gestisce validazione e invio form contatti a Supabase
 */

// ============================================
// Supabase Configuration
// ============================================
// TODO: Sostituisci con le tue credenziali Supabase
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// ============================================
// DOM Elements
// ============================================
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn?.querySelector('.btn-text');
const loadingIndicator = submitBtn?.querySelector('.loading-indicator');
const successMessage = document.getElementById('success-message');
const errorToast = document.getElementById('error-toast');
const errorClose = document.getElementById('error-close');

// Form fields
const fields = {
    nome: document.getElementById('nome'),
    cognome: document.getElementById('cognome'),
    telefono: document.getElementById('telefono'),
    email: document.getElementById('email'),
    privacy: document.getElementById('privacy')
};

// Error elements
const errors = {
    nome: document.getElementById('nome-error'),
    cognome: document.getElementById('cognome-error'),
    telefono: document.getElementById('telefono-error'),
    email: document.getElementById('email-error'),
    privacy: document.getElementById('privacy-error')
};

// ============================================
// Validation Rules
// ============================================
const validators = {
    nome: (value) => {
        if (!value || value.trim().length < 2) {
            return 'Il nome deve contenere almeno 2 caratteri';
        }
        return null;
    },
    cognome: (value) => {
        if (!value || value.trim().length < 2) {
            return 'Il cognome deve contenere almeno 2 caratteri';
        }
        return null;
    },
    telefono: (value) => {
        if (!value) {
            return 'Il telefono è obbligatorio';
        }
        // Rimuovi spazi e trattini per la validazione
        const cleaned = value.replace(/[\s\-]/g, '');
        // Pattern italiano: +39 seguito da 9-10 cifre, oppure 9-10 cifre
        const phonePattern = /^(\+39)?[0-9]{9,10}$/;
        if (!phonePattern.test(cleaned)) {
            return 'Inserisci un numero di telefono valido (es. 333 1234567)';
        }
        return null;
    },
    email: (value) => {
        if (!value) {
            return 'L\'email è obbligatoria';
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            return 'Inserisci un\'email valida (es. nome@email.com)';
        }
        return null;
    },
    privacy: (checked) => {
        if (!checked) {
            return 'Devi accettare la privacy policy per procedere';
        }
        return null;
    }
};

// ============================================
// Validation Functions
// ============================================
function validateField(fieldName) {
    const field = fields[fieldName];
    const errorElement = errors[fieldName];
    
    if (!field || !errorElement) return true;
    
    const value = field.type === 'checkbox' ? field.checked : field.value;
    const error = validators[fieldName](value);
    
    if (error) {
        field.classList.add('error');
        errorElement.textContent = error;
        return false;
    } else {
        field.classList.remove('error');
        errorElement.textContent = '';
        return true;
    }
}

function validateAllFields() {
    let isValid = true;
    
    for (const fieldName in fields) {
        if (!validateField(fieldName)) {
            isValid = false;
        }
    }
    
    return isValid;
}

function clearAllErrors() {
    for (const fieldName in fields) {
        const field = fields[fieldName];
        const errorElement = errors[fieldName];
        if (field) field.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    }
}

// ============================================
// UI State Functions
// ============================================
function setLoading(isLoading) {
    if (submitBtn) {
        submitBtn.disabled = isLoading;
    }
    if (btnText) {
        btnText.style.display = isLoading ? 'none' : 'inline';
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'inline-flex' : 'none';
    }
}

function showSuccess() {
    if (form) form.style.display = 'none';
    if (successMessage) successMessage.style.display = 'block';
}

function showError(message = 'Si è verificato un errore. Riprova più tardi.') {
    if (errorToast) {
        const errorText = errorToast.querySelector('.error-text');
        if (errorText) errorText.textContent = message;
        errorToast.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    }
}

function hideError() {
    if (errorToast) {
        errorToast.style.display = 'none';
    }
}

function resetForm() {
    if (form) {
        form.reset();
        clearAllErrors();
    }
}

// ============================================
// Supabase API
// ============================================
async function submitToSupabase(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            nome: data.nome,
            cognome: data.cognome,
            telefono: data.telefono,
            email: data.email,
            privacy_accepted: data.privacy,
            user_agent: navigator.userAgent
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return response;
}

// ============================================
// Form Submit Handler
// ============================================
async function handleSubmit(event) {
    event.preventDefault();
    
    // Clear previous errors
    hideError();
    
    // Validate all fields
    if (!validateAllFields()) {
        return;
    }
    
    // Get form data
    const formData = {
        nome: fields.nome.value.trim(),
        cognome: fields.cognome.value.trim(),
        telefono: fields.telefono.value.replace(/[\s\-]/g, ''),
        email: fields.email.value.trim().toLowerCase(),
        privacy: fields.privacy.checked
    };
    
    // Set loading state
    setLoading(true);
    
    try {
        await submitToSupabase(formData);
        
        // Success!
        resetForm();
        showSuccess();
        
    } catch (error) {
        console.error('Submit error:', error);
        
        // Determine error message
        let errorMessage = 'Si è verificato un errore. Riprova più tardi.';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Errore del server. Riprova più tardi.';
        }
        
        showError(errorMessage);
        
    } finally {
        setLoading(false);
    }
}

// ============================================
// Event Listeners
// ============================================
function initForm() {
    // Form submit
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Real-time validation on blur
    for (const fieldName in fields) {
        const field = fields[fieldName];
        if (field) {
            field.addEventListener('blur', () => validateField(fieldName));
            
            // Clear error on input
            field.addEventListener('input', () => {
                const errorElement = errors[fieldName];
                if (errorElement && errorElement.textContent) {
                    field.classList.remove('error');
                    errorElement.textContent = '';
                }
            });
        }
    }
    
    // Error toast close button
    if (errorClose) {
        errorClose.addEventListener('click', hideError);
    }
}

// ============================================
// Initialize on DOM Ready
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
} else {
    initForm();
}

