#!/usr/bin/env node
/**
 * Bots in Public — Day 1 Slide Deck
 * "Starting from Zero: How I Set Up an AI Project"
 *
 * Drop this file into: rr/projects/slides-generator/
 * Usage: node projects/slides-generator/create-bip-day1.js
 * Output: Shareable Google Slides URL printed to console
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { google } = require('googleapis');
const { createAuth } = require('../../src/services/googleSlidesService');

// --- Slide content ---

const SLIDES = [

  // ── TITLE ──
  {
    type: 'title',
    heading: 'Bots in Public',
    body: 'Day 1: Starting from Zero\nHow I set up an AI project — live, no edits, no shortcuts.'
  },

  // ── SECTION: The Hook ──
  { type: 'section', heading: '👀 The Hook' },
  {
    type: 'content',
    heading: 'Nobody shows you this part',
    body: 'Every AI tutorial starts mid-project.\n\n"Just clone the repo."\n"Add your API key."\n"It\'s easy."\n\nDay 1 is always skipped.\n\nI\'m not skipping it.'
  },
  {
    type: 'content',
    heading: 'What this series is',
    body: 'I\'m building an AI-powered business called Review Recovery.\n\nOne day at a time. On camera. Every mistake included.\n\nIf AI makes you feel like getting dressed in public —\nyou\'re exactly who this is for.'
  },

  // ── SECTION: The Setup ──
  { type: 'section', heading: '🛠️ The Setup' },
  {
    type: 'content',
    heading: 'Step 1 — Create the folder',
    body: 'Open Terminal.\n\nType:\n  mkdir ~/Projects/bip\n  cd bip\n\nThat\'s it. You have a project.\n\nMost people never get past this step because they\'re waiting to feel ready.\nYou\'re never ready. Start anyway.'
  },
  {
    type: 'content',
    heading: 'Step 2 — Create CLAUDE.md',
    body: 'This is the AI\'s memory.\n\nWithout it, Claude forgets everything every single session.\nYou\'d re-explain your entire project from scratch. Every. Time.\n\nCLAUDE.md tells the AI:\n• What this project is\n• Who it\'s for\n• What tools we\'re using\n• What NOT to do'
  },
  {
    type: 'content',
    heading: 'What goes in CLAUDE.md',
    body: '# Project: Bots in Public\n\nA daily build-in-public series demystifying AI for non-coders.\n\n## Stack\n- Claude Code (AI assistant)\n- n8n (automation)\n- Node.js (scripts)\n\n## Rules\n- Explain everything like I\'m new\n- No skipping steps\n- Ship daily'
  },
  {
    type: 'content',
    heading: 'Step 3 — Create .env',
    body: 'Your .env file holds your API keys.\n\nCreate it:\n  touch .env\n\nThen add your keys:\n  ANTHROPIC_API_KEY=your_key_here\n\n⚠️ NEVER share this file.\n⚠️ NEVER commit it to GitHub.\n\nAdd .env to your .gitignore immediately.'
  },
  {
    type: 'content',
    heading: 'Step 4 — Git init',
    body: 'Save your work. Even on Day 1.\n\n  git init\n  echo ".env" >> .gitignore\n  git add .\n  git commit -m "Day 1: project scaffold"\n\nWhy?\nBecause in 3 weeks when something breaks,\nyou\'ll want to go back in time.\n\nGit is your time machine.'
  },

  // ── SECTION: The Mindset ──
  { type: 'section', heading: '🧠 The Mindset' },
  {
    type: 'content',
    heading: 'The thing nobody tells you about AI',
    body: 'AI doesn\'t replace thinking.\n\nIt replaces typing.\n\nYou still need to know:\n• What you want to build\n• Who it\'s for\n• What problem it solves\n\nThe clearer your thinking, the better the AI output.\nGarbage in. Garbage out.'
  },
  {
    type: 'content',
    heading: 'Why I use CLAUDE.md',
    body: 'Imagine hiring someone brilliant —\nbut they have zero short-term memory.\n\nEvery morning they forget who you are.\n\nYou\'d write them a briefing note, right?\n\nThat\'s CLAUDE.md.\nIt\'s a briefing note for your AI.'
  },
  {
    type: 'content',
    heading: 'The biggest mistake beginners make',
    body: 'Asking AI to do everything at once.\n\n"Build me a full app that does X, Y and Z."\n\nResult: a mess you don\'t understand and can\'t maintain.\n\nInstead:\n→ One task at a time\n→ Review every output\n→ You stay in control'
  },

  // ── SECTION: Today\'s Output ──
  { type: 'section', heading: '✅ Today\'s Output' },
  {
    type: 'content',
    heading: 'What we built today',
    body: 'In under 5 minutes:\n\n✅ Created project folder\n✅ Wrote CLAUDE.md (AI memory)\n✅ Created .env (API keys)\n✅ Git initialised\n✅ .gitignore set up\n\nThis is the foundation every single project runs on.\nNothing fancy. Nothing scary.'
  },
  {
    type: 'content',
    heading: 'File structure after Day 1',
    body: 'bip/\n├── CLAUDE.md       ← AI memory\n├── .env            ← API keys (never share)\n├── .gitignore      ← Keeps .env out of GitHub\n└── README.md       ← What is this project?'
  },

  // ── SECTION: TikTok / Shorts Script ──
  { type: 'section', heading: '🎬 TikTok / Shorts Script' },
  {
    type: 'tweet',
    heading: 'Hook (0–3s)',
    body: '"The part every AI tutorial skips is Day 1.\n\nI\'m not skipping it."'
  },
  {
    type: 'tweet',
    heading: 'Problem (3–10s)',
    body: '"Most people never start because they\'re waiting to feel ready.\n\nYou\'re never ready. Here\'s what to do instead."'
  },
  {
    type: 'tweet',
    heading: 'Demo (10–40s)',
    body: '[Show terminal]\n"One folder. One file. That\'s Day 1."\n\nmkdir bip → CLAUDE.md → .env → git init\n\n"This is the foundation. Every AI project I build starts here."'
  },
  {
    type: 'tweet',
    heading: 'Payoff (40–55s)',
    body: '"Claude now knows who I am, what I\'m building, and what not to do.\n\nI didn\'t write a single line of app code today.\n\nAnd that\'s exactly right."'
  },
  {
    type: 'tweet',
    heading: 'CTA (55–60s)',
    body: '"Day 2 tomorrow: first working script.\n\nFollow if you want to see how far AI can take a non-coder."'
  },

  // ── SECTION: X Thread ──
  { type: 'section', heading: '🧵 X / Twitter Thread' },
  {
    type: 'tweet',
    heading: 'Tweet 1 — Hook',
    body: 'Day 1 of building an AI business live.\n\nI started with an empty folder.\n\nHere\'s exactly what I did — and why most people skip this:'
  },
  {
    type: 'tweet',
    heading: 'Tweet 2 — The Problem',
    body: 'Every AI tutorial starts mid-project.\n\n"Just clone the repo" assumes you already know what a repo is.\n\nI\'m going back to zero. Step by step. No jargon.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 3 — CLAUDE.md',
    body: 'First thing I built: CLAUDE.md\n\nNot code. A text file.\n\nIt\'s a briefing note for my AI. Without it, Claude forgets everything every session.\n\nYou wouldn\'t hire someone and give them no context. Same applies here.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 4 — .env',
    body: 'Second: .env file\n\nThis holds your API keys.\n\nRules:\n→ Never share it\n→ Never commit it to GitHub\n→ Add it to .gitignore immediately\n\nI learned this the hard way so you don\'t have to.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 5 — Git',
    body: 'Third: git init\n\nEven on Day 1.\n\nIn 3 weeks when something breaks, you\'ll want to go back in time.\n\nGit is your time machine. Use it from day zero.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 6 — The mindset',
    body: 'The thing nobody tells you about AI:\n\nIt doesn\'t replace thinking. It replaces typing.\n\nYou still decide what to build and why.\n\nThe clearer your thinking → the better the AI output.\n\nGarbage in. Garbage out.'
  },
  {
    type: 'tweet',
    heading: 'Tweet 7 — CTA',
    body: 'Day 2 tomorrow: first working script.\n\nBuilding in public because AI shouldn\'t feel like getting dressed in front of strangers.\n\nFollow along → I\'m documenting every step.'
  }
];

// --- Helpers ---

const uid = (prefix = 'obj') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const rgb = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });

const BG = {
  title:   rgb(10, 10, 10),
  section: rgb(20, 20, 20),
  content: rgb(18, 18, 24),
  tweet:   rgb(15, 20, 25)
};

const ACCENT = rgb(255, 90, 50);

const FONT = {
  title:   { heading: 52, body: 26 },
  section: { heading: 48 },
  content: { heading: 28, body: 20 },
  tweet:   { heading: 20, body: 21 }
};

const W = 9144000;
const H = 5143500;
const MARGIN = 457200;

function buildSlideRequests(slide, insertionIndex) {
  const slideId = uid('slide');
  const requests = [];
  const type = slide.type;

  requests.push({
    createSlide: {
      objectId: slideId,
      insertionIndex,
      slideLayoutReference: { predefinedLayout: 'BLANK' }
    }
  });

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

  // Accent bar at top (except title)
  if (type !== 'title') {
    const barId = uid('bar');
    requests.push({
      createShape: {
        objectId: barId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: W, unit: 'EMU' }, height: { magnitude: 57150, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, unit: 'EMU' }
        }
      }
    });
    requests.push({
      updateShapeProperties: {
        objectId: barId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: ACCENT } } }
        },
        fields: 'shapeBackgroundFill'
      }
    });
  }

  const headingY = type === 'section' ? Math.round(H / 2 - 500000) : type === 'title' ? Math.round(H * 0.25) : MARGIN + 114400;
  const headingH = type === 'section' ? 1000000 : 700000;

  const headingId = uid('heading');
  requests.push({
    createShape: {
      objectId: headingId,
      shapeType: 'TEXT_BOX',
      elementProperties: {
        pageObjectId: slideId,
        size: { width: { magnitude: W - MARGIN * 2, unit: 'EMU' }, height: { magnitude: headingH, unit: 'EMU' } },
        transform: { scaleX: 1, scaleY: 1, translateX: MARGIN, translateY: headingY, unit: 'EMU' }
      }
    }
  });
  requests.push({ insertText: { objectId: headingId, text: slide.heading } });

  const headingFontSize = FONT[type]?.heading || 28;
  const headingColor = type === 'section' ? rgb(255, 90, 50) : rgb(255, 255, 255);

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

  if (type === 'section' || type === 'title') {
    requests.push({
      updateParagraphStyle: {
        objectId: headingId,
        style: { alignment: 'CENTER' },
        fields: 'alignment'
      }
    });
  }

  if (slide.body) {
    const bodyId = uid('body');
    const bodyY = type === 'title' ? Math.round(H * 0.55) : headingY + headingH + 114400;
    const bodyH = H - bodyY - MARGIN;

    requests.push({
      createShape: {
        objectId: bodyId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: W - MARGIN * 2, unit: 'EMU' }, height: { magnitude: bodyH, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: MARGIN, translateY: bodyY, unit: 'EMU' }
        }
      }
    });
    requests.push({ insertText: { objectId: bodyId, text: slide.body } });

    const bodyFontSize = FONT[type]?.body || 20;
    const bodyColor = type === 'title' ? rgb(200, 200, 200) : type === 'tweet' ? rgb(180, 220, 255) : rgb(210, 220, 235);

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

async function main() {
  const auth = createAuth();
  const slidesApi = google.slides({ version: 'v1', auth });
  const driveApi  = google.drive({ version: 'v3', auth });

  console.log('Creating Bots in Public — Day 1 deck...');
  const pres = await slidesApi.presentations.create({
    requestBody: { title: 'Bots in Public — Day 1: Starting from Zero' }
  });

  const presentationId = pres.data.presentationId;
  const defaultSlideId = pres.data.slides[0].objectId;

  const allRequests = [];
  allRequests.push({ deleteObject: { objectId: defaultSlideId } });

  SLIDES.forEach((slide, index) => {
    const { requests } = buildSlideRequests(slide, index);
    allRequests.push(...requests);
  });

  console.log(`Building ${SLIDES.length} slides...`);
  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: allRequests }
  });

  console.log('Setting sharing permissions...');
  await driveApi.permissions.create({
    fileId: presentationId,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  const slidesUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  console.log('\n=== Done! ===\n');
  console.log('Bots in Public Day 1 deck:', slidesUrl);
  console.log('');
}

main().catch(err => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
