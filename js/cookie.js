/**
 * WindTre Mirabello - Cookie Banner Handler
 * Gestisce il consenso cookie GDPR
 */

// ============================================
// Configuration
// ============================================
const COOKIE_CONSENT_KEY = 'windtre_cookie_consent';
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

// ============================================
// DOM Elements
// ============================================
const cookieBanner = document.getElementById('cookie-banner');
const acceptButton = document.getElementById('cookie-accept');

// ============================================
// Cookie Functions
// ============================================
function getCookieConsent() {
    try {
        return localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
        // localStorage non disponibile (es. navigazione privata)
        return null;
    }
}

function setCookieConsent(value) {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            accepted: value,
            timestamp: new Date().toISOString()
        }));
    } catch (e) {
        // localStorage non disponibile
        console.warn('Unable to save cookie consent to localStorage');
    }
}

// ============================================
// Banner Functions
// ============================================
function showBanner() {
    if (cookieBanner) {
        cookieBanner.style.display = 'block';
        cookieBanner.classList.remove('hidden');
    }
}

function hideBanner() {
    if (cookieBanner) {
        cookieBanner.classList.add('hidden');
        // Rimuovi completamente dopo l'animazione
        setTimeout(() => {
            cookieBanner.style.display = 'none';
        }, 300);
    }
}

function handleAccept() {
    setCookieConsent(true);
    hideBanner();
}

// ============================================
// Initialization
// ============================================
function initCookieBanner() {
    const consent = getCookieConsent();
    
    if (!consent) {
        // Prima visita - mostra banner
        showBanner();
    } else {
        // Già accettato - nascondi banner
        if (cookieBanner) {
            cookieBanner.style.display = 'none';
        }
    }
    
    // Event listener per il pulsante Accetta
    if (acceptButton) {
        acceptButton.addEventListener('click', handleAccept);
    }
}

// ============================================
// Initialize on DOM Ready
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    initCookieBanner();
}

