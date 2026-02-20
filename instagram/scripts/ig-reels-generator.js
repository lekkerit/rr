#!/usr/bin/env node

/**
 * Instagram Reels/Stories Generator
 * Reads a content.json and generates an animated HTML file using anime.js.
 * The output is a self-playing sequence of slides with entrance animations
 * and transitions, designed to be screen-recorded as a Reel.
 *
 * Usage: node instagram/scripts/ig-reels-generator.js instagram/posts/post-10/content.json
 * Output: instagram/posts/post-10/reels.html
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'instagram', 'templates');
const SLIDES_DIR = path.join(TEMPLATES_DIR, 'slides');

// Import the static generator for slide HTML building
const { buildSlideHtml } = require('./ig-generator');

// Import animation presets
const { PRESETS, SLIDE_ANIMATION_MAP, SLIDE_TRANSITION, SLIDE_HOLD_DURATION } = require(
  path.join(TEMPLATES_DIR, 'animations', 'presets.js')
);

function generateReelsHtml(content) {
  const designSystemCss = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'design-system.css'), 'utf-8'
  );

  // Build each slide's inner HTML
  const slidesHtml = content.slides.map((slide, i) => {
    const html = buildSlideHtml(slide);
    // Wrap each slide in a reel-slide container for animation control
    return `<div class="reel-slide" data-index="${i}" data-type="${slide.type}" style="display:none;">${html}</div>`;
  }).join('\n');

  // Build animation config as JSON for the player script
  const animationConfig = content.slides.map(slide => {
    const presetName = slide.animation || SLIDE_ANIMATION_MAP[slide.type] || 'fade-up';
    return { type: slide.type, preset: presetName };
  });

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reel - ${content.post_id} - @reviewrecovery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
  <style>
    ${designSystemCss}

    /* Override body for reel mode — single slide, centered */
    body {
      background: #000;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1080px;
      height: 1080px;
      overflow: hidden;
    }

    .reel-container {
      width: 1080px;
      height: 1080px;
      position: relative;
      overflow: hidden;
    }

    .reel-slide {
      position: absolute;
      inset: 0;
    }

    /* Scale slides to fill 1080x1080 */
    .reel-slide .slide {
      width: 1080px;
      height: 1080px;
      border-radius: 0;
      box-shadow: none;
    }

    .reel-slide .slide-content {
      padding: 108px;
    }

    /* Scale up typography for 1080px */
    .reel-slide .big-number { font-size: 13.5rem; margin-bottom: 32px; }
    .reel-slide .big-text { font-size: 5.4rem; margin-bottom: 32px; }
    .reel-slide .medium-text { font-size: 3.78rem; margin-bottom: 22px; }
    .reel-slide .subtitle { font-size: 2.7rem; }
    .reel-slide .small-text { font-size: 2.16rem; margin-top: 22px; }
    .reel-slide .slide-footer { padding: 32px 0; font-size: 1.89rem; }
    .reel-slide .divider { width: 162px; height: 11px; margin: 43px auto; }
    .reel-slide .step-number { width: 151px; height: 151px; font-size: 4.05rem; margin-bottom: 54px; }
    .reel-slide .cta-button { padding: 38px 86px; border-radius: 81px; font-size: 2.7rem; margin-top: 54px; }
    .reel-slide .stat-badge { padding: 22px 54px; border-radius: 81px; font-size: 2.43rem; margin-top: 43px; }
    .reel-slide .icon-star { font-size: 6.75rem; margin-bottom: 43px; }

    /* Fout items scaled */
    .reel-slide .fout-item { max-width: 810px; }
    .reel-slide .fout-number { width: 86px; height: 86px; line-height: 86px; font-size: 2.3rem; margin-bottom: 32px; }
    .reel-slide .fout-title { font-size: 3.51rem; margin-bottom: 22px; }
    .reel-slide .fout-detail { font-size: 2.43rem; }
    .reel-slide .fout-example { margin-top: 32px; padding: 32px; font-size: 2.16rem; }
    .reel-slide .fix-number { width: 86px; height: 86px; line-height: 86px; font-size: 2.97rem; margin-bottom: 32px; }

    /* Review/response cards scaled */
    .reel-slide .review-card, .reel-slide .response-card { max-width: 864px; padding: 54px; border-radius: 38px; }
    .reel-slide .review-card-avatar { width: 103px; height: 103px; font-size: 2.3rem; }
    .reel-slide .review-card-name { font-size: 2.3rem; }
    .reel-slide .review-card-meta { font-size: 1.89rem; }
    .reel-slide .review-card-stars { font-size: 2.43rem; margin-bottom: 27px; }
    .reel-slide .review-card-text { font-size: 2.16rem; }
    .reel-slide .response-card-badge { padding: 14px 32px; font-size: 1.76rem; margin-bottom: 32px; }
    .reel-slide .response-card-badge svg { width: 32px; height: 32px; }
    .reel-slide .response-card-text { font-size: 2.16rem; }

    /* Stat bars scaled */
    .reel-slide .stat-bar-container { max-width: 756px; margin-top: 43px; }
    .reel-slide .stat-bar-label { font-size: 2.16rem; margin-bottom: 16px; }
    .reel-slide .stat-bar { height: 32px; border-radius: 16px; }

    /* Split slide scaled */
    .reel-slide .split-side { padding: 65px 54px; }
    .reel-slide .split-label { font-size: 1.89rem; margin-bottom: 32px; }
    .reel-slide .mini-review { padding: 38px; border-radius: 27px; }
    .reel-slide .mini-avatar { width: 76px; height: 76px; font-size: 1.76rem; }
    .reel-slide .mini-name { font-size: 1.89rem; }
    .reel-slide .mini-stars { font-size: 1.89rem; }
    .reel-slide .mini-text { font-size: 1.89rem; }
    .reel-slide .mini-response { margin-top: 27px; padding: 27px; font-size: 1.76rem; }
    .reel-slide .mini-response-label { font-size: 1.62rem; margin-bottom: 11px; }
    .reel-slide .split-slide-footer { padding: 27px 0; font-size: 1.76rem; }

    /* Initial state for animated elements — hidden */
    .reel-slide .slide-content > * {
      opacity: 0;
    }
  </style>
</head>
<body>

<div class="reel-container">
${slidesHtml}
</div>

<script>
const ANIMATION_CONFIG = ${JSON.stringify(animationConfig, null, 2)};
const HOLD_DURATION = ${SLIDE_HOLD_DURATION};
const TRANSITION_DURATION = ${SLIDE_TRANSITION.duration};

const PRESETS = {
  'fade-up': {
    targets: null, // set per slide
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    delay: anime.stagger(150),
    easing: 'easeOutCubic',
  },
  'scale-in': {
    targets: null,
    scale: [0.5, 1],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutBack',
  },
  'stagger': {
    targets: null,
    translateX: [-40, 0],
    opacity: [0, 1],
    duration: 500,
    delay: anime.stagger(120, { start: 200 }),
    easing: 'easeOutQuart',
  },
  'split-reveal': {
    targets: null,
    translateX: function(el, i) { return i === 0 ? [-50, 0] : [50, 0]; },
    opacity: [0, 1],
    duration: 700,
    delay: anime.stagger(200),
    easing: 'easeOutCubic',
  },
  'card-pop': {
    targets: null,
    scale: [0.85, 1],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutBack',
  },
  'bar-fill': {
    targets: null,
    width: function(el) { return [0, el.style.width || el.getAttribute('data-width')]; },
    duration: 1000,
    delay: anime.stagger(300, { start: 400 }),
    easing: 'easeOutQuart',
  },
};

const slides = document.querySelectorAll('.reel-slide');
let currentSlide = 0;

function getAnimationTargets(slideEl, presetName) {
  if (presetName === 'scale-in') return slideEl.querySelectorAll('.big-number');
  if (presetName === 'split-reveal') return slideEl.querySelectorAll('.split-side');
  if (presetName === 'card-pop') return slideEl.querySelectorAll('.review-card, .response-card');
  if (presetName === 'bar-fill') return slideEl.querySelectorAll('.stat-bar-fill, .stat-bar-fill-red');
  return slideEl.querySelectorAll('.slide-content > *');
}

async function playSlide(index) {
  const slideEl = slides[index];
  const config = ANIMATION_CONFIG[index];

  // Show this slide
  slideEl.style.display = 'block';
  slideEl.style.opacity = '1';

  // Reset all animated elements to visible (the CSS hides them)
  const allElements = slideEl.querySelectorAll('.slide-content > *');

  // Get preset
  const preset = { ...PRESETS[config.preset] || PRESETS['fade-up'] };
  const targets = getAnimationTargets(slideEl, config.preset);
  preset.targets = targets;

  // For non-targeted elements (like footer), make them visible
  const footer = slideEl.querySelector('.slide-footer, .split-slide-footer');
  if (footer) footer.style.opacity = '1';

  // Play entrance animation
  await anime(preset).finished;

  // Make all elements fully visible after animation
  allElements.forEach(el => { el.style.opacity = '1'; });

  // Hold
  await new Promise(resolve => setTimeout(resolve, HOLD_DURATION));

  // Fade out transition (except last slide)
  if (index < slides.length - 1) {
    await anime({
      targets: slideEl,
      opacity: [1, 0],
      duration: TRANSITION_DURATION,
      easing: 'easeInOutQuad',
    }).finished;
    slideEl.style.display = 'none';
  }
}

async function playAll() {
  // Small initial delay before starting
  await new Promise(resolve => setTimeout(resolve, 500));

  for (let i = 0; i < slides.length; i++) {
    await playSlide(i);
  }

  // Hold last slide for an extra moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Signal completion (used by puppeteer recorder)
  document.body.setAttribute('data-reel-complete', 'true');
}

// Auto-play on load
document.fonts.ready.then(() => playAll());
</script>

</body>
</html>`;
}

function generate(contentPath) {
  const absolutePath = path.resolve(contentPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Content file not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  const outputDir = path.dirname(absolutePath);

  const html = generateReelsHtml(content);

  const outputPath = path.join(outputDir, 'reels.html');
  fs.writeFileSync(outputPath, html, 'utf-8');

  const totalDuration = content.slides.length * (SLIDE_HOLD_DURATION + SLIDE_TRANSITION.duration + 800) + 1500;
  console.log(`Generated: ${outputPath}`);
  console.log(`  ${content.slides.length} animated slide(s)`);
  console.log(`  Estimated duration: ${(totalDuration / 1000).toFixed(1)}s`);

  return outputPath;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node instagram/scripts/ig-reels-generator.js <content.json>');
    console.log('Example: node instagram/scripts/ig-reels-generator.js instagram/posts/post-10/content.json');
    process.exit(1);
  }
  generate(args[0]);
}

module.exports = { generate, generateReelsHtml };
