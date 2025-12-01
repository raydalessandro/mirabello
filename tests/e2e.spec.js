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
    
    test('dovrebbe mostrare il volantino', async ({ page }) => {
      await expect(page.locator('.volantino-image')).toBeVisible();
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
      await page.locator('input[name="telefono"]').fill('123');
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
      await page.locator('button[type="submit"]').click();
      
      await expect(page.locator('.error-message').filter({ hasText: /privacy/i })).toBeVisible();
    });
  });

  test.describe('Invio form', () => {
    
    test('dovrebbe mostrare stato loading durante invio', async ({ page }) => {
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

      await expect(page.locator('button[type="submit"]')).toBeDisabled();
      await expect(page.locator('.loading-indicator')).toBeVisible();
    });

    test('dovrebbe mostrare messaggio successo dopo invio', async ({ page }) => {
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
    });

    test('dovrebbe gestire errore di rete', async ({ page }) => {
      await page.route('**/rest/v1/contacts**', async route => {
        await route.abort('failed');
      });

      await page.locator('input[name="nome"]').fill('Mario');
      await page.locator('input[name="cognome"]').fill('Rossi');
      await page.locator('input[name="telefono"]').fill('3331234567');
      await page.locator('input[name="email"]').fill('test@email.com');
      await page.locator('input[name="privacy"]').check();
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('.error-toast')).toBeVisible();
    });
  });

  test.describe('Cookie Banner', () => {
    
    test('dovrebbe mostrare il cookie banner alla prima visita', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await expect(page.locator('#cookie-banner')).toBeVisible();
    });

    test('dovrebbe nascondere il banner dopo click su Accetta', async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      await page.locator('#cookie-accept').click();
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
      await expect(page.locator('form#contact-form')).toBeVisible();
    });
  });
});
