// Receives bug reports from the support page's dialog and posts them to a
// Discord channel. Nothing is stored.
//
//   * The webhook URL lives in the DISCORD_BUG_REPORT_WEBHOOK environment
//     variable (Netlify: Site configuration → Environment variables), never in
//     the repo or the page.
//   * allowed_mentions is empty, so text like "@everyone" in a report can't
//     ping the channel.
//   * A hidden "website" field catches simple bots: if it's filled in, the
//     request is accepted and quietly dropped.

const WHERE = { android: 'Android app', web: 'Web app', website: 'Website' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  // Only accept reports sent from this site.
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) {
    return json({ error: 'Not allowed.' }, 403);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (body.website) return json({ ok: true });

  const message = String(body.message ?? '').trim();
  const canContact = body.canContact === true;
  const email = String(body.email ?? '').trim();
  const where = WHERE[body.where] ?? 'Not given';

  if (!message) return json({ error: 'Please describe what went wrong.' }, 400);
  // Discord limit: embed description 4096 characters.
  if (message.length > 4000) return json({ error: 'The report is too long (max 4000 characters).' }, 400);
  if (canContact && (email.length > 200 || !EMAIL.test(email))) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const webhook = process.env.DISCORD_BUG_REPORT_WEBHOOK;
  if (!webhook) return json({ error: 'Bug reporting is not set up yet. Please email us instead.' }, 503);

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Purrfolio',
      allowed_mentions: { parse: [] },
      embeds: [{
        title: '🐞 New bug report (website)',
        description: message,
        color: 0x7433e6, // the app's accent
        timestamp: new Date().toISOString(),
        // Discord limit: field value 1024 characters.
        fields: [
          { name: 'From', value: canContact ? email : 'Not given', inline: true },
          { name: 'Contact', value: canContact ? '✅ OK to email' : '🚫 Don\'t email', inline: true },
          { name: 'Where', value: where, inline: true },
          { name: 'Browser', value: (req.headers.get('user-agent') || 'Unknown').slice(0, 1000) },
        ],
      }],
    }),
  });

  if (!res.ok) return json({ error: 'Could not send the report. Please try again, or email us.' }, 502);
  return json({ ok: true });
};

export const config = {
  path: '/api/report-bug',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
