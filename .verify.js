// Playwright verification for Elite Cuts Studio
// Takes full-page screenshots at desktop + mobile widths and checks critical
// color / layout conditions, flags issues for fix-up.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'https://forge-dev-studio.github.io/elite-cuts-studio/';
const OUT = path.join(__dirname, '.screenshots');

const issues = [];
const info = [];

async function run() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();

  // ── Desktop ─────────────────────────────────────────────
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await desktop.newPage();

  // Cache bust
  await page.goto(URL + '?v=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
  // Let animations settle
  await page.waitForTimeout(1200);

  // Scroll through the page to trigger all IntersectionObservers,
  // then wait for fallback .rev reveal (2s window.load timeout in page).
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    const step = Math.max(400, Math.floor(window.innerHeight * 0.7));
    for (let y = 0; y <= h; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  // Full page screenshot
  await page.screenshot({ path: path.join(OUT, '01-desktop-full.png'), fullPage: true });

  // Hero screenshot
  const hero = await page.locator('.hero').first();
  await hero.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await hero.screenshot({ path: path.join(OUT, '02-desktop-hero.png') });

  // Signature styles section
  const sig = await page.locator('#signature').first();
  if (await sig.count() > 0) {
    await sig.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await sig.screenshot({ path: path.join(OUT, '03-desktop-signature.png') });
  } else {
    issues.push('Signature section (#signature) not found on page');
  }

  // Gallery polaroid wall
  const gal = await page.locator('#gallery').first();
  if (await gal.count() > 0) {
    await gal.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await gal.screenshot({ path: path.join(OUT, '04-desktop-gallery.png') });
  }

  // Storefront panel inside About
  const store = await page.locator('.storefront-panel').first();
  if (await store.count() > 0) {
    await store.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await store.screenshot({ path: path.join(OUT, '05-desktop-storefront.png') });
  } else {
    issues.push('Storefront panel (.storefront-panel) not found');
  }

  // Services vegas billboard
  const services = await page.locator('#services').first();
  if (await services.count() > 0) {
    await services.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await services.screenshot({ path: path.join(OUT, '06-desktop-services.png') });
  }

  // ── Computed color checks ───────────────────────────────
  const computed = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const vars = {
      orange: root.getPropertyValue('--orange').trim(),
      olive:  root.getPropertyValue('--olive').trim(),
      cream:  root.getPropertyValue('--cream').trim(),
      ink:    root.getPropertyValue('--ink').trim(),
      amber:  root.getPropertyValue('--amber').trim(),
      gold:   root.getPropertyValue('--gold').trim(),
    };

    const hero = document.querySelector('.hero-right');
    const heroBg = hero ? getComputedStyle(hero).backgroundColor : null;

    const about = document.querySelector('.about');
    const aboutBg = about ? getComputedStyle(about).backgroundColor : null;

    const cta = document.querySelector('.cta');
    const ctaBg = cta ? getComputedStyle(cta).backgroundColor : null;

    const footer = document.querySelector('.footer');
    const footerBg = footer ? getComputedStyle(footer).backgroundColor : null;

    const sigHalo1 = document.querySelector('.sig-halo.c-orange');
    const sigHalo1Bg = sigHalo1 ? getComputedStyle(sigHalo1).backgroundColor : null;

    const sigHalo2 = document.querySelector('.sig-halo.c-olive');
    const sigHalo2Bg = sigHalo2 ? getComputedStyle(sigHalo2).backgroundColor : null;

    const sigHalo3 = document.querySelector('.sig-halo.c-amber');
    const sigHalo3Bg = sigHalo3 ? getComputedStyle(sigHalo3).backgroundColor : null;

    const polaroidImg = document.querySelector('.polaroid-img');
    const polaroidFilter = polaroidImg ? getComputedStyle(polaroidImg).filter : null;

    const heroLogo = document.querySelector('#heroPhoto');
    const heroLogoOk = heroLogo ? heroLogo.complete && heroLogo.naturalWidth > 0 : false;

    const navLogo = document.querySelector('.nav-logo-img');
    const navLogoOk = navLogo ? navLogo.complete && navLogo.naturalWidth > 0 : false;

    return {
      vars, heroBg, aboutBg, ctaBg, footerBg,
      sigHalo1Bg, sigHalo2Bg, sigHalo3Bg,
      polaroidFilter, heroLogoOk, navLogoOk,
      title: document.title,
    };
  });

  info.push('Computed style snapshot:');
  info.push(JSON.stringify(computed, null, 2));

  // Assertions
  const expectedRed = '#c8323f';
  const expectedNavy = '#1e3a6f';
  const expectedInk = '#0a0a0a';

  function normHex(h) { return h.toLowerCase().replace(/\s/g, ''); }

  if (normHex(computed.vars.orange) !== expectedRed) {
    issues.push(`--orange should be ${expectedRed}, got ${computed.vars.orange}`);
  }
  if (normHex(computed.vars.olive) !== expectedNavy) {
    issues.push(`--olive should be ${expectedNavy}, got ${computed.vars.olive}`);
  }
  if (normHex(computed.vars.ink) !== expectedInk) {
    issues.push(`--ink should be ${expectedInk}, got ${computed.vars.ink}`);
  }

  // Sig halo should be red / navy / black
  if (computed.sigHalo1Bg && !computed.sigHalo1Bg.includes('200, 50, 63')) {
    issues.push(`sig-halo.c-orange bg should be red rgb(200,50,63), got ${computed.sigHalo1Bg}`);
  }
  if (computed.sigHalo2Bg && !computed.sigHalo2Bg.includes('30, 58, 111')) {
    issues.push(`sig-halo.c-olive bg should be navy rgb(30,58,111), got ${computed.sigHalo2Bg}`);
  }
  if (computed.sigHalo3Bg && !computed.sigHalo3Bg.includes('10, 10, 10')) {
    issues.push(`sig-halo.c-amber bg should be black rgb(10,10,10), got ${computed.sigHalo3Bg}`);
  }

  // Polaroid photos should be grayscale
  if (computed.polaroidFilter && !computed.polaroidFilter.includes('grayscale')) {
    issues.push(`polaroid-img filter should include grayscale, got ${computed.polaroidFilter}`);
  }

  // Logo images must load
  if (!computed.heroLogoOk) issues.push('Hero logo image (#heroPhoto) failed to load');
  if (!computed.navLogoOk) issues.push('Nav logo image (.nav-logo-img) failed to load');

  if (computed.title !== 'Elite Cuts Studio | Gainesville, GA') {
    issues.push(`Page title should be "Elite Cuts Studio | Gainesville, GA", got "${computed.title}"`);
  }

  // ── Mobile ──────────────────────────────────────────────
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mpage = await mobile.newPage();
  await mpage.goto(URL + '?v=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
  await mpage.waitForTimeout(1200);
  await mpage.screenshot({ path: path.join(OUT, '10-mobile-full.png'), fullPage: true });

  const mhero = await mpage.locator('.hero').first();
  await mhero.scrollIntoViewIfNeeded();
  await mpage.waitForTimeout(400);
  await mhero.screenshot({ path: path.join(OUT, '11-mobile-hero.png') });

  const msig = await mpage.locator('#signature').first();
  if (await msig.count() > 0) {
    await msig.scrollIntoViewIfNeeded();
    await mpage.waitForTimeout(400);
    await msig.screenshot({ path: path.join(OUT, '12-mobile-signature.png') });
  }

  // Check mobile layout no horizontal overflow
  const overflow = await mpage.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 2) {
    issues.push(`Mobile horizontal overflow detected: ${overflow}px`);
  }

  // Console errors
  const consoleErrors = [];
  mpage.on('pageerror', e => consoleErrors.push(e.message));

  await browser.close();

  console.log('--- INFO ---');
  console.log(info.join('\n'));
  console.log('\n--- ISSUES ---');
  if (issues.length === 0) {
    console.log('No issues detected.');
  } else {
    issues.forEach((i, n) => console.log(`${n + 1}. ${i}`));
  }
  console.log('\nScreenshots saved to:', OUT);
  process.exit(issues.length > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('FATAL:', e);
  process.exit(2);
});
