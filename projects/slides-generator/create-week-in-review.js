#!/usr/bin/env node
/**
 * Creates a Google Slides deck with this week's social media content.
 * Sections: TikTok/YouTube Shorts, YouTube Long-Form, X (Twitter) Thread.
 *
 * Prerequisites:
 *   Run setup-auth.js first and add GOOGLE_SLIDES_REFRESH_TOKEN to .env
 *
 * Usage: node projects/slides-generator/create-week-in-review.js
 * Output: Shareable Google Slides URL printed to console
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { google } = require('googleapis');
const { createAuth } = require('../../src/services/googleSlidesService');

// --- Slide content ---

const SLIDES = [
  // Title
  {
    type: 'title',
    heading: 'Week in Review',
    body: 'What I Built with AI — March 2026'
  },

  // ── SECTION: TikTok / YouTube Shorts ──
  {
    type: 'section',
    heading: 'TikTok / YouTube Shorts'
  },
  {
    type: 'content',
    heading: 'Hook (0–3s)',
    body: '"I built an AI system that runs a business this week.\n\nAnd I didn\'t write a single line of code myself."'
  },
  {
    type: 'content',
    heading: 'Problem (3–10s)',
    body: 'Most restaurants respond to Google reviews wrong.\n\nCopy-paste replies. Generic thank-yous. Customers can smell it — and it kills trust.'
  },
  {
    type: 'content',
    heading: 'Solution (10–25s)',
    body: 'Review Recovery.\n\nThe AI reads every review, understands the tone, and writes a response that sounds like the actual owner wrote it. Warm. Specific. Human.\n\nOwner approves. It posts.'
  },
  {
    type: 'content',
    heading: 'The rr/ Folder Structure (25–40s)',
    body: 'I gave my AI a proper office:\n\n• Memory — Claude knows the full project without re-explaining every session\n• Scripts — Reliable tools that handle the mechanical work, every time\n• Directives — An employee handbook so the AI follows the same process consistently'
  },
  {
    type: 'content',
    heading: 'Proof (40–55s)',
    body: 'What shipped this week:\n\n• 3 professional Instagram reels — scripted, animated, exported as video\n• 9-table database — tracking restaurants, reviews, AI responses, analytics\n• Full automation chain — Google review → AI writes reply → you approve → it posts'
  },
  {
    type: 'content',
    heading: 'CTA (55–60s)',
    body: 'Building in public.\n\nFollow along if you want to see how far AI can take a one-person business — no coding required.'
  },

  // ── SECTION: YouTube Long-Form ──
  {
    type: 'section',
    heading: 'YouTube Long-Form'
  },
  {
    type: 'content',
    heading: 'Intro (0–2 min)',
    body: 'Review Recovery: an AI tool that responds to restaurant Google reviews automatically — in a way that sounds human.\n\nBuilding it solo means you need AI to help build the builder. This week I fixed the biggest problem with AI tools: they forget everything.'
  },
  {
    type: 'content',
    heading: 'The Problem With AI Tools (2–4 min)',
    body: 'Every session, you start from scratch.\n\nRe-explain the product. Re-explain the rules. Re-explain the tone.\n\nIt\'s like hiring someone with no memory.\n\nThis week I fixed that.'
  },
  {
    type: 'content',
    heading: 'The 3-Layer System (4–8 min)',
    body: '1. Instructions — plain English SOPs in a folder (like an employee handbook)\n2. AI decides — reads the instructions, routes to the right tools, handles errors\n3. Scripts execute — deterministic, reliable, same output every time\n\nWhy it works: 90% accuracy × 5 steps = 59% success. Push complexity into scripts. Let AI just decide.'
  },
  {
    type: 'content',
    heading: 'What Shipped This Week (8–12 min)',
    body: '• 3 Instagram reels (show them on screen)\n• Airtable database — 9 tables tracking the whole business lifecycle\n• Full automation: Google review → Claude reads it → writes reply → owner approves → posts\n• Claude Code project structure with memory, scripts, and directives'
  },
  {
    type: 'content',
    heading: 'Why This Matters If You Don\'t Code (12–15 min)',
    body: 'You don\'t need to build this yourself.\n\nYou need to:\n  1. Know what you want to build\n  2. Describe it clearly\n  3. Review the output\n\nAI does the boring part. You stay in control.\n\nThe tools exist. The systems work. You just have to use them.'
  },
  {
    type: 'content',
    heading: 'Outro',
    body: 'Building in public.\n\nDrop a comment if you want to see a specific part of the build.\n\nSubscribe for weekly updates.'
  },

  // ── SECTION: X / Twitter Thread ──
  {
    type: 'section',
    heading: 'X / Twitter Thread'
  },
  {
    type: 'tweet',
    heading: 'Tweet 1 — Hook',
    body: 'This week I built an AI system that responds to restaurant Google reviews, creates Instagram reels, and manages its own database.\n\nI\'m not a developer.\n\nHere\'s what I actually shipped:'
  },
  {
    type: 'tweet',
    heading: 'Tweet 2 — The Folder Structure',
    body: 'First, I gave Claude a memory.\n\nSet up a project folder where the AI knows:\n• What the product is\n• Who it\'s for\n• What tools to use\n• What process to follow\n\nNo more re-explaining the context every session. It just picks up where we left off.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 3 — The Automation',
    body: 'The core product: Review Recovery.\n\nA restaurant gets a Google review. AI reads it, understands the tone, and writes a response that sounds like the actual owner wrote it.\n\nNot a template. Not "thank you for your feedback." A real reply.\n\nOwner approves it. It posts.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 4 — The Content Engine',
    body: 'Also shipped: 3 Instagram reels. Fully AI-assisted.\n\nScript → slides → animation → MP4. All from a JSON file describing the content.\n\nI described what I wanted. Scripts did the rest.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 5 — The Database',
    body: 'And the database: 9 Airtable tables tracking restaurants, reviews, AI responses, approvals, analytics.\n\nDesigned to handle 20+ customers before needing an upgrade.\n\nMVP ready. Waiting for pilot customers.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 6 — What\'s Next',
    body: 'Next week:\n→ First pilot restaurant onboarded\n→ Live Google reviews flowing through the system\n→ Measuring how AI responses affect booking inquiries\n\nBuilding in public. Follow along.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 7 — CTA',
    body: 'If you\'re scared of AI or think you need to code to use it — this thread is for you.\n\nThe tools exist. The systems work. You just have to build the habit of using them.\n\nMore next week.'
  }
];

// --- Helpers ---

const uid = (prefix = 'obj') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// RGB helpers (0-1 range)
const rgb = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });

// Slide background colors by type
const BG = {
  title:   rgb(15, 52, 96),    // deep blue
  section: rgb(10, 25, 49),    // darker navy
  content: rgb(22, 33, 62),    // navy
  tweet:   rgb(21, 32, 43)     // twitter dark
};

// Font sizes
const FONT = {
  title:   { heading: 48, body: 28 },
  section: { heading: 44 },
  content: { heading: 26, body: 20 },
  tweet:   { heading: 20, body: 21 }
};

// Slide width/height in EMU (10" × 5.625" — standard 16:9)
const W = 9144000;
const H = 5143500;
const MARGIN = 457200; // 0.5 inch

function buildSlideRequests(slide, insertionIndex) {
  const slideId = uid('slide');
  const requests = [];
  const type = slide.type;

  // Add slide
  requests.push({
    createSlide: {
      objectId: slideId,
      insertionIndex,
      slideLayoutReference: { predefinedLayout: 'BLANK' }
    }
  });

  // Background color
  requests.push({
    updatePageProperties: {
      objectId: slideId,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: BG[type] || BG.content } }
        }
      },
      fields: 'pageBackgroundFill'
    }
  });

  // Heading position varies by slide type
  const headingY = type === 'section' ? Math.round(H / 2 - 500000) : MARGIN;
  const headingH = type === 'section' ? 1000000 : 700000;

  // Heading text box
  const headingId = uid('heading');
  requests.push({
    createShape: {
      objectId: headingId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          width:  { magnitude: W - MARGIN * 2, unit: 'EMU' },
          height: { magnitude: headingH, unit: 'EMU' }
        },
        transform: { scaleX: 1, scaleY: 1, translateX: MARGIN, translateY: headingY, unit: 'EMU' }
      }
    }
  });
  requests.push({ insertText: { objectId: headingId, text: slide.heading } });

  const headingFontSize = FONT[type]?.heading || 28;
  const headingColor = type === 'section' ? rgb(255, 200, 50) : rgb(255, 255, 255);

  requests.push({
    updateTextStyle: {
      objectId: headingId,
      style: {
        fontSize: { magnitude: headingFontSize, unit: 'PT' },
        foregroundColor: { opaqueColor: { rgbColor: headingColor } },
        bold: true,
        fontFamily: 'Google Sans'
      },
      fields: 'fontSize,foregroundColor,bold,fontFamily'
    }
  });

  // Paragraph alignment: center for section/title, left for others
  if (type === 'section' || type === 'title') {
    requests.push({
      updateParagraphStyle: {
        objectId: headingId,
        style: { alignment: 'CENTER' },
        fields: 'alignment'
      }
    });
  }

  // Body text box (if present)
  if (slide.body) {
    const bodyId = uid('body');
    const bodyY = type === 'title' ? Math.round(H / 2) : headingY + headingH + 114400;
    const bodyH = H - bodyY - MARGIN;

    requests.push({
      createShape: {
        objectId: bodyId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width:  { magnitude: W - MARGIN * 2, unit: 'EMU' },
            height: { magnitude: bodyH, unit: 'EMU' }
          },
          transform: { scaleX: 1, scaleY: 1, translateX: MARGIN, translateY: bodyY, unit: 'EMU' }
        }
      }
    });
    requests.push({ insertText: { objectId: bodyId, text: slide.body } });

    const bodyFontSize = FONT[type]?.body || 20;
    const bodyColor = type === 'title' ? rgb(180, 210, 255) : rgb(220, 230, 245);

    requests.push({
      updateTextStyle: {
        objectId: bodyId,
        style: {
          fontSize: { magnitude: bodyFontSize, unit: 'PT' },
          foregroundColor: { opaqueColor: { rgbColor: bodyColor } },
          fontFamily: 'Google Sans'
        },
        fields: 'fontSize,foregroundColor,fontFamily'
      }
    });

    if (type === 'title') {
      requests.push({
        updateParagraphStyle: {
          objectId: bodyId,
          style: { alignment: 'CENTER' },
          fields: 'alignment'
        }
      });
    }
  }

  return { slideId, requests };
}

// --- Main ---

async function main() {
  const auth = createAuth();
  const slidesApi = google.slides({ version: 'v1', auth });
  const driveApi  = google.drive({ version: 'v3', auth });

  // 1. Create presentation
  console.log('Creating presentation...');
  const pres = await slidesApi.presentations.create({
    requestBody: { title: 'Week in Review — What I Built with AI (March 2026)' }
  });

  const presentationId = pres.data.presentationId;
  const defaultSlideId = pres.data.slides[0].objectId;

  // 2. Build all batch requests
  const allRequests = [];

  // Delete the default blank slide
  allRequests.push({ deleteObject: { objectId: defaultSlideId } });

  // Build each slide
  SLIDES.forEach((slide, index) => {
    const { requests } = buildSlideRequests(slide, index);
    allRequests.push(...requests);
  });

  // 3. Execute batch update
  console.log(`Building ${SLIDES.length} slides...`);
  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: allRequests }
  });

  // 4. Make shareable (anyone with link can view)
  console.log('Setting sharing permissions...');
  await driveApi.permissions.create({
    fileId: presentationId,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  // 5. Done
  const slidesUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  console.log('\n=== Done! ===\n');
  console.log('Your presentation:', slidesUrl);
  console.log('');
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  if (err.message.includes('GOOGLE_SLIDES_REFRESH_TOKEN')) {
    console.error('Run setup-auth.js first to authenticate with Google Slides.');
  }
  process.exit(1);
});
