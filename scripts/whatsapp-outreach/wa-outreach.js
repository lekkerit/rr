#!/usr/bin/env node
/**
 * WhatsApp Outreach Script — Review Recovery
 *
 * Usage:
 *   node wa-outreach.js              # send up to 20 messages/day
 *   node wa-outreach.js --dry-run    # preview messages without sending
 *
 * Input:  prospects.csv (name, restaurant, phone, rating, unanswered_count, city)
 * Output: sent-log.json (append-only send history)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// ─── Config ──────────────────────────────────────────────────────────────────

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '20', 10);
const DRY_RUN = process.argv.includes('--dry-run');

const PROSPECTS_FILE = path.join(__dirname, 'prospects.csv');
const SENT_LOG_FILE = path.join(__dirname, 'sent-log.json');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const twilioClient = !DRY_RUN
  ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadProspects() {
  const raw = fs.readFileSync(PROSPECTS_FILE, 'utf8').trim();
  const lines = raw.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  }).filter(p => p.phone); // skip empty rows
}

function loadSentLog() {
  if (!fs.existsSync(SENT_LOG_FILE)) return {};
  return JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8'));
}

function saveSentLog(log) {
  fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(log, null, 2));
}

function countSentToday(log) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return Object.values(log).filter(entry => {
    return new Date(entry.sentAt) >= todayStart;
  }).length;
}

// ─── Message Generation ───────────────────────────────────────────────────────

async function generateMessage(prospect) {
  const { restaurant, rating, city } = prospect;
  const ratingLine = rating ? `- Google-beoordeling: ${rating}★\n` : '';

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Schrijf een WhatsApp openingsbericht voor de eigenaar van ${restaurant} in ${city}.

Context:
${ratingLine}- Ik help restaurants met het professioneel beantwoorden van Google-reviews
- Ik wil 2 gratis voorbeeldreacties aanbieden, geen verplichtingen
- Nooit prijzen noemen in het eerste bericht

Strenge regels:
- Nederlands, informeel maar professioneel
- Noem de restaurantnaam${rating ? ' en de beoordeling' : ''}
- Focus op de waarde: meer vertrouwen bij nieuwe gasten, betere reputatie
- Bied 2 gratis voorbeelden aan als concrete eerste stap
- Mag NIET bevatten: AI, geautomatiseerd, bot, software, algoritme, prijzen, €
- Maximaal 80 woorden
- WhatsApp-toon: korte alinea's, geen formele aanhef
- Eindig met een open vraag

Geef alleen de berichttekst terug, niets anders.`
    }]
  });

  return message.content[0].text.trim();
}

// ─── Send ─────────────────────────────────────────────────────────────────────

async function sendWhatsApp(phone, messageText) {
  const msg = await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${phone}`,
    body: messageText
  });
  return msg.sid;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nReview Recovery — WhatsApp Outreach${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('─'.repeat(45));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }
  if (!DRY_RUN && (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM)) {
    console.error('Error: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM must all be set');
    process.exit(1);
  }

  const prospects = loadProspects();
  const sentLog = loadSentLog();
  const sentToday = countSentToday(sentLog);
  const remaining = DAILY_LIMIT - sentToday;

  console.log(`Prospects loaded: ${prospects.length}`);
  console.log(`Sent today: ${sentToday} / ${DAILY_LIMIT}`);

  if (remaining <= 0) {
    console.log('\nDaily limit reached. Run again tomorrow.');
    return;
  }

  const unsent = prospects.filter(p => !sentLog[p.phone]);
  console.log(`Unsent prospects: ${unsent.length}`);
  console.log(`Will send up to: ${Math.min(unsent.length, remaining)}\n`);

  let sent = 0;
  let failed = 0;

  for (const prospect of unsent) {
    if (sent >= remaining) break;

    const { name, restaurant, phone } = prospect;
    process.stdout.write(`→ ${restaurant} (${phone}) ... `);

    try {
      const messageText = await generateMessage(prospect);

      if (DRY_RUN) {
        console.log('DRY RUN\n');
        console.log(`  ${messageText.replace(/\n/g, '\n  ')}\n`);
        sentLog[phone] = {
          restaurant,
          name,
          sentAt: new Date().toISOString(),
          twilioSid: 'dry-run',
          status: 'dry-run'
        };
      } else {
        const sid = await sendWhatsApp(phone, messageText);
        console.log(`sent (${sid})`);
        sentLog[phone] = {
          restaurant,
          name,
          sentAt: new Date().toISOString(),
          twilioSid: sid,
          status: 'sent'
        };
      }

      saveSentLog(sentLog);
      sent++;

      // Brief pause between sends to avoid rate limits
      if (!DRY_RUN && sent < remaining) {
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(45));
  console.log(`Done. Sent: ${sent} | Failed: ${failed} | Skipped (already sent): ${prospects.length - unsent.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
