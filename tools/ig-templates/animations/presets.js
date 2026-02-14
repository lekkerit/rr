/**
 * Animation presets for Instagram Reels/Stories
 * Used by ig-reels-generator.js to wrap slides with anime.js animations.
 *
 * Each preset defines entrance animations for elements within a slide.
 * All durations in milliseconds.
 */

const PRESETS = {
  // Fade + slide up — default for text-heavy slides
  'fade-up': {
    targets: '.slide-content > *',
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    delay: function(el, i) { return i * 150; },
    easing: 'easeOutCubic',
  },

  // Scale in — for big numbers and stats
  'scale-in': {
    targets: '.big-number',
    scale: [0.5, 1],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutBack',
  },

  // Stagger children — for lists, steps, fout items
  'stagger': {
    targets: '.slide-content > *',
    translateX: [-40, 0],
    opacity: [0, 1],
    duration: 500,
    delay: function(el, i) { return 200 + i * 120; },
    easing: 'easeOutQuart',
  },

  // Split reveal — for before/after slides
  'split-reveal': {
    targets: '.split-side',
    translateX: function(el, i) { return i === 0 ? [-50, 0] : [50, 0]; },
    opacity: [0, 1],
    duration: 700,
    delay: function(el, i) { return i * 200; },
    easing: 'easeOutCubic',
  },

  // Card pop — for review/response cards
  'card-pop': {
    targets: '.review-card, .response-card',
    scale: [0.85, 1],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutBack',
  },

  // Bar fill — for stat bars
  'bar-fill': {
    targets: '.stat-bar-fill, .stat-bar-fill-red',
    width: [0, function(el) { return el.style.width; }],
    duration: 1000,
    delay: function(el, i) { return 400 + i * 300; },
    easing: 'easeOutQuart',
  },
};

// Map slide types to their default animation preset
const SLIDE_ANIMATION_MAP = {
  'hook-stat': 'scale-in',
  'hook-text': 'fade-up',
  'body-text': 'fade-up',
  'body-stat': 'scale-in',
  'body-step': 'stagger',
  'body-fout': 'stagger',
  'body-split': 'split-reveal',
  'body-review': 'card-pop',
  'body-response': 'card-pop',
  'body-stat-bars': 'bar-fill',
  'cta': 'fade-up',
};

// Transition between slides
const SLIDE_TRANSITION = {
  duration: 400,
  easing: 'easeInOutQuad',
};

// How long to hold each slide before transitioning (ms)
const SLIDE_HOLD_DURATION = 2500;

if (typeof module !== 'undefined') {
  module.exports = { PRESETS, SLIDE_ANIMATION_MAP, SLIDE_TRANSITION, SLIDE_HOLD_DURATION };
}
