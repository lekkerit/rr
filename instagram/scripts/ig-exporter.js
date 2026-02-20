#!/usr/bin/env node

/**
 * Instagram Post PNG Exporter
 * Generates a temporary self-contained HTML file per slide at 1080x1080,
 * then screenshots it with Puppeteer.
 *
 * Usage: node instagram/scripts/ig-exporter.js instagram/posts/post-10/post.html
 * Output: instagram/posts/post-10/slides/slide-1.png, slide-2.png, etc.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const HERO_IMAGE = path.join(PROJECT_ROOT, 'assets', 'images', 'hero-restaurant.jpg');

// Scale factor: 400px design → 1080px export
const SF = 1080 / 400;

function buildExportHtml(slideOuterHtml) {
  // Read the design system CSS and fix image paths to absolute file:// URLs
  let css = fs.readFileSync(
    path.join(PROJECT_ROOT, 'instagram', 'templates', 'design-system.css'),
    'utf-8'
  );

  // Replace relative image path with absolute file:// path
  css = css.replace(
    /url\(['"]?\.\.\/\.\.\/assets\/images\/hero-restaurant\.jpg['"]?\)/g,
    `url('file://${HERO_IMAGE}')`
  );

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${css}

    /* Export overrides: single slide at 1080x1080 */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 1080px !important;
      height: 1080px !important;
      overflow: hidden !important;
      background: #000 !important;
      display: block !important;
      min-height: auto !important;
      gap: 0 !important;
    }

    .slide {
      width: 1080px !important;
      height: 1080px !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
    }

    /* Scale all typography and components by ${SF.toFixed(2)}x */
    .slide-content { padding: ${Math.round(40 * SF)}px !important; }
    .big-number { font-size: ${(5 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; }
    .big-text { font-size: ${(2 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; }
    .medium-text { font-size: ${(1.4 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(8 * SF)}px !important; }
    .subtitle { font-size: ${(1 * SF).toFixed(1)}rem !important; }
    .small-text { font-size: ${(0.8 * SF).toFixed(2)}rem !important; margin-top: ${Math.round(8 * SF)}px !important; }
    .slide-footer { padding: ${Math.round(12 * SF)}px 0 !important; font-size: ${(0.7 * SF).toFixed(2)}rem !important; }
    .divider { width: ${Math.round(60 * SF)}px !important; height: ${Math.round(4 * SF)}px !important; margin: ${Math.round(16 * SF)}px auto !important; }
    .step-number { width: ${Math.round(56 * SF)}px !important; height: ${Math.round(56 * SF)}px !important; font-size: ${(1.5 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(20 * SF)}px !important; }
    .cta-button { padding: ${Math.round(14 * SF)}px ${Math.round(32 * SF)}px !important; border-radius: ${Math.round(30 * SF)}px !important; font-size: ${(1 * SF).toFixed(1)}rem !important; margin-top: ${Math.round(20 * SF)}px !important; }
    .stat-badge { padding: ${Math.round(8 * SF)}px ${Math.round(20 * SF)}px !important; border-radius: ${Math.round(30 * SF)}px !important; font-size: ${(0.9 * SF).toFixed(2)}rem !important; margin-top: ${Math.round(16 * SF)}px !important; }
    .icon-star { font-size: ${(2.5 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(16 * SF)}px !important; }
    .accent-underline { border-bottom-width: ${Math.round(4 * SF)}px !important; padding-bottom: ${Math.round(4 * SF)}px !important; }

    /* Fout items */
    .fout-item { max-width: ${Math.round(300 * SF)}px !important; }
    .fout-number { width: ${Math.round(32 * SF)}px !important; height: ${Math.round(32 * SF)}px !important; line-height: ${Math.round(32 * SF)}px !important; font-size: ${(0.85 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; }
    .fout-title { font-size: ${(1.3 * SF).toFixed(1)}rem !important; margin-bottom: ${Math.round(8 * SF)}px !important; }
    .fout-detail { font-size: ${(0.9 * SF).toFixed(2)}rem !important; }
    .fout-example { margin-top: ${Math.round(12 * SF)}px !important; padding: ${Math.round(12 * SF)}px !important; font-size: ${(0.8 * SF).toFixed(2)}rem !important; }
    .fix-number { width: ${Math.round(32 * SF)}px !important; height: ${Math.round(32 * SF)}px !important; line-height: ${Math.round(32 * SF)}px !important; font-size: ${(1.1 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; }

    /* Review/response cards */
    .review-card, .response-card { max-width: ${Math.round(320 * SF)}px !important; padding: ${Math.round(20 * SF)}px !important; border-radius: ${Math.round(14 * SF)}px !important; }
    .review-card-header { gap: ${Math.round(10 * SF)}px !important; margin-bottom: ${Math.round(12 * SF)}px !important; }
    .review-card-avatar { width: ${Math.round(38 * SF)}px !important; height: ${Math.round(38 * SF)}px !important; font-size: ${(0.85 * SF).toFixed(2)}rem !important; }
    .review-card-name { font-size: ${(0.85 * SF).toFixed(2)}rem !important; }
    .review-card-meta { font-size: ${(0.7 * SF).toFixed(2)}rem !important; }
    .review-card-stars { font-size: ${(0.9 * SF).toFixed(2)}rem !important; letter-spacing: ${Math.round(SF)}px !important; margin-bottom: ${Math.round(10 * SF)}px !important; }
    .review-card-text { font-size: ${(0.8 * SF).toFixed(2)}rem !important; }
    .response-card { border-left-width: ${Math.round(4 * SF)}px !important; }
    .response-card-badge { padding: ${Math.round(5 * SF)}px ${Math.round(12 * SF)}px !important; border-radius: ${Math.round(16 * SF)}px !important; font-size: ${(0.65 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; gap: ${Math.round(6 * SF)}px !important; }
    .response-card-badge svg { width: ${Math.round(12 * SF)}px !important; height: ${Math.round(12 * SF)}px !important; }
    .response-card-text { font-size: ${(0.8 * SF).toFixed(2)}rem !important; }

    /* Stat bars */
    .stat-bar-container { max-width: ${Math.round(280 * SF)}px !important; margin-top: ${Math.round(16 * SF)}px !important; }
    .stat-bar-label { font-size: ${(0.8 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(6 * SF)}px !important; }
    .stat-bar { height: ${Math.round(12 * SF)}px !important; border-radius: ${Math.round(6 * SF)}px !important; }

    /* Split layout */
    .split-side { padding: ${Math.round(24 * SF)}px ${Math.round(20 * SF)}px !important; }
    .split-label { font-size: ${(0.7 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(12 * SF)}px !important; }
    .split-slide-footer { padding: ${Math.round(10 * SF)}px 0 !important; font-size: ${(0.65 * SF).toFixed(2)}rem !important; }
    .mini-review { padding: ${Math.round(14 * SF)}px !important; border-radius: ${Math.round(10 * SF)}px !important; }
    .mini-review-header { gap: ${Math.round(8 * SF)}px !important; margin-bottom: ${Math.round(8 * SF)}px !important; }
    .mini-avatar { width: ${Math.round(28 * SF)}px !important; height: ${Math.round(28 * SF)}px !important; font-size: ${(0.65 * SF).toFixed(2)}rem !important; }
    .mini-name { font-size: ${(0.7 * SF).toFixed(2)}rem !important; }
    .mini-stars { font-size: ${(0.7 * SF).toFixed(2)}rem !important; }
    .mini-text { font-size: ${(0.7 * SF).toFixed(2)}rem !important; }
    .mini-response { margin-top: ${Math.round(10 * SF)}px !important; padding: ${Math.round(10 * SF)}px !important; font-size: ${(0.65 * SF).toFixed(2)}rem !important; }
    .mini-response-label { font-size: ${(0.6 * SF).toFixed(2)}rem !important; margin-bottom: ${Math.round(4 * SF)}px !important; }
    .mini-response-present { border-left-width: ${Math.round(3 * SF)}px !important; }
  </style>
</head>
<body>
${slideOuterHtml}
</body>
</html>`;
}

async function exportSlides(htmlPath) {
  const absolutePath = path.resolve(htmlPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`HTML file not found: ${absolutePath}`);
    process.exit(1);
  }

  const outputDir = path.join(path.dirname(absolutePath), 'slides');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // First, extract each slide's outerHTML from the source file
  const extractPage = await browser.newPage();
  await extractPage.setViewport({ width: 1200, height: 4000 });
  await extractPage.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });

  const slideHtmls = await extractPage.evaluate(() => {
    return Array.from(document.querySelectorAll('.slide')).map(s => s.outerHTML);
  });
  await extractPage.close();

  console.log(`Found ${slideHtmls.length} slide(s)`);

  // For each slide, create a self-contained HTML and screenshot it
  for (let i = 0; i < slideHtmls.length; i++) {
    const exportHtml = buildExportHtml(slideHtmls[i]);
    const tmpHtmlPath = path.join(outputDir, `_export_slide_${i + 1}.html`);
    fs.writeFileSync(tmpHtmlPath, exportHtml, 'utf-8');

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.goto(`file://${tmpHtmlPath}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    // Wait for background images
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));

    const outputPath = path.join(outputDir, `slide-${i + 1}.png`);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    await page.close();

    // Clean up temp HTML
    fs.unlinkSync(tmpHtmlPath);

    console.log(`  Exported: slide-${i + 1}.png (1080x1080)`);
  }

  await browser.close();
  console.log(`\nDone! ${slideHtmls.length} PNG(s) saved to: ${outputDir}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node instagram/scripts/ig-exporter.js <post.html>');
    console.log('Example: node instagram/scripts/ig-exporter.js instagram/posts/post-10/post.html');
    process.exit(1);
  }
  exportSlides(args[0]).catch(err => {
    console.error('Export failed:', err.message);
    process.exit(1);
  });
}

module.exports = { exportSlides };
