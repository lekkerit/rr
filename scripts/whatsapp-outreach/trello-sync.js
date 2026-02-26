/**
 * trello-sync.js — Create Trello session cards when a queue file is generated.
 *
 * Reads from .env:
 *   TRELLO_API_KEY
 *   TRELLO_TOKEN
 *   TRELLO_BACKLOG_LIST_ID  (optional, defaults to [rr] Outreach Kanban Backlog)
 *   TRELLO_WA_LABEL_ID      (optional, defaults to WA Outreach orange label)
 */

const DEFAULT_BACKLOG_LIST_ID = '699c6ec547b88617a9d0b3e4';
const DEFAULT_WA_LABEL_ID     = '699c68cca5224e92ef92c0cf';

const DAY_NAMES = ['*Sun*', '*Mon*', '*Tues*', '*Weds*', '*Thurs*', '*Fri*', '*Sat*'];

const SESSIONS = [
  { time: '10:00-11:30', period: 'AM' },
  { time: '14:30-16:30', period: 'PM' }
];

async function trelloPost(path, body, apiKey, token) {
  const url = `https://api.trello.com/1${path}?key=${apiKey}&token=${token}`;
  const res = await fetch(url, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trello API ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Create AM + PM session cards in Trello Backlog for the given date.
 *
 * @param {string} dateStr       - ISO date string, e.g. '2026-02-24'
 * @param {string} queueFilePath - Absolute path to the generated queue HTML file
 */
async function createSessionCards(dateStr, queueFilePath) {
  const apiKey  = process.env.TRELLO_API_KEY;
  const token   = process.env.TRELLO_TOKEN;
  const listId  = process.env.TRELLO_BACKLOG_LIST_ID || DEFAULT_BACKLOG_LIST_ID;
  const labelId = process.env.TRELLO_WA_LABEL_ID     || DEFAULT_WA_LABEL_ID;

  if (!apiKey || !token) {
    throw new Error('TRELLO_API_KEY and TRELLO_TOKEN must be set in .env');
  }

  // Parse day name — use noon UTC to avoid timezone edge cases
  const dayIndex = new Date(`${dateStr}T12:00:00Z`).getDay();
  const dayName  = DAY_NAMES[dayIndex];
  const queueUrl = `file://${queueFilePath}`;

  for (const { time, period } of SESSIONS) {
    const name = `${dayName} ${time} [${period}] send x20 prospect messages`;
    const desc = `Send x20 prospect messages in the ${time} [${period}]\n${queueUrl}`;

    await trelloPost('/cards', {
      idList   : listId,
      name,
      desc,
      idLabels : [labelId]
    }, apiKey, token);
  }
}

module.exports = { createSessionCards };
