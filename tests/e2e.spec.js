// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing Page WindTre Mirabello', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Accetta il cookie banner se presente
    const cookieBanner = page.locator('#cookie-banner');
    if (await cookieBanner.isVisible()) {
      await page.locator('#cookie-accept').click();
      await expect(cookieBanner).not.toBeVisible();
    }
  });

  test.describe('Rendering della pagina', () => {
    
    test('dovrebbe mostrare il titolo principale', async ({ page }) => {
      await expect(page.locator('h1.hero-title')).toBeVisible();
      await expect(page.locator('.hero-title-internet')).toContainText('INTERNET CASA 5G');
    });

    test('dovrebbe mostrare la velocità 300 Mega', async ({ page }) => {
      await expect(page.locator('.speed-number')).toContainText('300');
      await expect(page.locator('.speed-unit')).toContainText('MEGA');
    });

    test('dovrebbe mostrare i benefici principali', async ({ page }) => {
      await expect(page.locator('.benefit-card h3').filter({ hasText: 'Internet Illimitato' })).toBeVisible();
      await expect(page.locator('.benefit-card h3').filter({ hasText: 'Giga Illimitati' })).toBeVisible();
      await expect(page.locator('.benefit-card h3').filter({ hasText: 'Wi-Fi' })).toBeVisible();
    });

    test('dovrebbe mostrare le info del negozio', async ({ page }) => {
      await expect(page.locator('.store-address')).toContainText('Centro Commerciale');
      await expect(page.locator('.store-location')).toContainText('MIRABELLO');
      await expect(page.locator('.store-address')).toContainText('Via Lombardia, 68');
      await expect(page.locator('.store-address')).toContainText('Cantù');
    });

    test('dovrebbe mostrare il numero WhatsApp', async ({ page }) => {
      await expect(page.locator('.whatsapp-number')).toContainText('392 845 1482');
    });

    test('dovrebbe avere link a privacy e cookie policy', async ({ page }) => {
      await expect(page.locator('footer a[href="privacy.html"]')).toBeVisible();
      await expect(page.locator('footer a[href="cookie.html"]')).toBeVisible();
    });
  });

  test.describe('Form di contatto', () => {
    
    test('dovrebbe mostrare il form contatti', async ({ page }) => {
      await expect(page.locator('form#contact-form')).toBeVisible();
    });

    test('dovrebbe avere tutti i campi richiesti', async ({ page }) => {
      await expect(page.locator('input[name="nome"]')).toBeVisible();
      await expect(page.locator('input[name="cognome"]')).toBeVisible();
      await expect(page.locator('input[name="telefono"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="privacy"]')).toBeVisible();
    });

    test('dovrebbe avere il pulsante di invio', async ({ page }) => {
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Validazione form', () => {
    
    test('dovrebbe mostrare errore se nome è vuoto', async ({ page }) => {
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /nome/i })).toBeVisible();
    });

    test('dovrebbe mostrare errore se cognome è vuoto', async ({ page }) => {
      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /cognome/i })).toBeVisible();
    });

    test('dovrebbe mostrare errore per telefono non valido', async ({ page }) => {
      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('123'); // troppo corto
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /telefono/i })).toBeVisible();
    });

    test('dovrebbe mostrare errore per email non valida', async ({ page }) => {
      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('email-non-valida');
      // Setta il checkbox direttamente via JavaScript (il checkbox è nascosto con CSS)
      await page.evaluate(() => {
        document.querySelector('input[name="privacy"]').checked = true;
      });
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /email/i })).toBeVisible();
    });

    test('dovrebbe mostrare errore se privacy non accettata', async ({ page }) => {
      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      // privacy non accettata
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /privacy/i })).toBeVisible();
    });

    test('dovrebbe accettare telefono con prefisso +39', async ({ page }) => {
      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('+393331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      
      // Non dovrebbe mostrare errore per il telefono
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('.error-message').filter({ hasText: /telefono/i })).not.toBeVisible();
    });
  });

  test.describe('Invio form', () => {
    
    test('dovrebbe mostrare stato loading durante invio', async ({ page }) => {
      // Mock della chiamata Supabase
      await page.route('**/rest/v1/contacts**', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({ status: 201, json: {} });
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      // Verifica stato loading
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      await expect(page.locator('.loading-indicator')).toBeVisible();
    });

    test('dovrebbe mostrare messaggio successo dopo invio', async ({ page }) => {
      // Mock della chiamata Supabase
      await page.route('**/rest/v1/contacts**', async route => {
        await route.fulfill({ status: 201, json: {} });
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText(/grazie|ricevuto|contatteremo/i);
    });

    test('dovrebbe gestire errore di rete', async ({ page }) => {
      // Mock errore di rete
      await page.route('**/rest/v1/contacts**', async route => {
        await route.abort('failed');
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('.error-toast, .error-alert')).toBeVisible();
    });

    test('dovrebbe gestire errore server', async ({ page }) => {
      // Mock errore server
      await page.route('**/rest/v1/contacts**', async route => {
        await route.fulfill({ status: 500, json: { error: 'Internal Server Error' } });
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('.error-toast, .error-alert')).toBeVisible();
    });

    test('dovrebbe resettare il form dopo invio con successo', async ({ page }) => {
      // Mock della chiamata Supabase
      await page.route('**/rest/v1/contacts**', async route => {
        await route.fulfill({ status: 201, json: {} });
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      // Attendi il messaggio di successo
      await expect(page.locator('.success-message')).toBeVisible();
      
      // I campi dovrebbero essere vuoti
      await expect(page.locator('input[name="nome"]')).toHaveValue('');
      await expect(page.locator('input[name="cognome"]')).toHaveValue('');
    });
  });

  test.describe('Cookie Banner', () => {
    
    test('dovrebbe mostrare il cookie banner alla prima visita', async ({ page, context }) => {
      // Cancella localStorage per simulare prima visita
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await expect(page.locator('#cookie-banner')).toBeVisible();
    });

    test('dovrebbe avere pulsante Accetta', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await expect(page.locator('#cookie-banner button').filter({ hasText: /accett/i })).toBeVisible();
    });

    test('dovrebbe avere link a maggiori informazioni', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await expect(page.locator('#cookie-banner a[href="cookie.html"]')).toBeVisible();
    });

    test('dovrebbe nascondere il banner dopo click su Accetta', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await page.locator('#cookie-banner button').filter({ hasText: /accett/i }).click();
      await expect(page.locator('#cookie-banner')).not.toBeVisible();
    });

    test('dovrebbe ricordare la preferenza cookie', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await page.locator('#cookie-banner button').filter({ hasText: /accett/i }).click();
      
      // Ricarica la pagina
      await page.reload();
      
      // Il banner non dovrebbe apparire
      await expect(page.locator('#cookie-banner')).not.toBeVisible();
    });
  });

  test.describe('Link Privacy e Cookie Policy', () => {
    
    test('dovrebbe navigare alla privacy policy', async ({ page }) => {
      await page.locator('footer a[href="privacy.html"]').click();
      await page.waitForURL(/privacy/);
      await expect(page.locator('h1')).toContainText(/privacy/i);
    });

    test('dovrebbe navigare alla cookie policy', async ({ page }) => {
      await page.locator('footer a[href="cookie.html"]').click();
      await page.waitForURL(/cookie/);
      await expect(page.locator('h1')).toContainText(/cookie/i);
    });
  });

  test.describe('Responsive Design', () => {
    
    test('dovrebbe essere responsive su mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Il form dovrebbe essere visibile
      await expect(page.locator('form#contact-form')).toBeVisible();
      
      // Il contenuto principale dovrebbe essere visibile
      await expect(page.locator('h1.hero-title')).toBeVisible();
    });

    test('dovrebbe essere responsive su tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('form#contact-form')).toBeVisible();
      await expect(page.locator('h1.hero-title')).toBeVisible();
    });
  });
});
