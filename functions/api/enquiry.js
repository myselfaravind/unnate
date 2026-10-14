/**
 * UNNATE — enquiry endpoint (Cloudflare Pages Function, served at /api/enquiry).
 *
 * Receives every enquiry form on the site as JSON and emails it to the studio through Resend.
 * There are three kinds of enquiry, one per audience, each with its own required fields:
 *   general  the homepage            — name, email, company, message
 *   clinic   /clinical-websites/     — name, email, clinic, message
 *   student  /final-year-projects/   — name, email, message
 * It answers { ok: true } only after Resend has accepted the email, so the site never
 * shows a success message for an enquiry that was not delivered.
 *
 * Set these in Cloudflare Pages → Settings → Variables and Secrets (never in the code):
 *   RESEND_API_KEY   (secret)  API key from https://resend.com/api-keys
 *   ENQUIRY_TO                 the inbox that should receive enquiries
 *   ENQUIRY_FROM     optional  e.g. "UNNATE Website <enquiries@unnate.com>" — the domain must be
 *                              verified in Resend. Defaults to Resend's test sender, which can only
 *                              deliver to the email address that owns the Resend account.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// For each kind: the fields it accepts, in the order they appear in the email, and the choices a checkbox group may hold.
const KINDS = {
  general: {
    subject: 'Studio enquiry',
    fields: [
      ['name', 'Name', 120, 'Enter your name.'],
      ['email', 'Email', 200, 'Enter your work email.'],
      ['company', 'Company or brand', 160, 'Enter your company or brand name.'],
      ['website', 'Website or social profile', 300],
      ['services', 'Needs help with', ['Web', 'Content & Social', 'Paid Campaigns', 'Clinic website', 'Final-year project', 'Not sure yet']],
      ['message', 'Project', 5000, 'Tell us a little about your project.']
    ]
  },
  clinic: {
    subject: 'Clinic website enquiry',
    fields: [
      ['name', 'Name', 120, 'Enter your name.'],
      ['email', 'Email', 200, 'Enter your email.'],
      ['clinic', 'Clinic or practice', 160, 'Enter the name of your clinic or practice.'],
      ['phone', 'Phone', 40],
      ['city', 'City', 100],
      ['website', 'Current website', 300],
      ['practice', 'Type of practice', ['Dental', 'General medical', 'Specialist', 'Skin, beauty or aesthetics', 'Wellness or spa', 'Other']],
      ['need', 'Looking for', ['A new website', 'A redesign', 'Not sure yet']],
      ['message', 'About the clinic', 5000, 'Tell us a little about your clinic and what you need.']
    ]
  },
  student: {
    subject: 'Final-year project enquiry',
    fields: [
      ['name', 'Name', 120, 'Enter your name.'],
      ['email', 'Email', 200, 'Enter your email.'],
      ['phone', 'Phone or WhatsApp', 40],
      ['college', 'College', 160],
      ['course', 'Degree and department', 120],
      ['deadline', 'Review or submission date', 120],
      ['stage', 'Where the project is', ['I have an idea', 'I need help choosing one', 'It is partly built']],
      ['needs', 'Needs', ['Working project', 'Documentation', 'Explanation guide']],
      ['message', 'About the project', 5000, 'Tell us a little about your project or idea.']
    ]
  }
};

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const clean = (v, max) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');

export async function onRequestPost({ request, env }) {
  // Only accept posts from the site itself.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json(403, { ok: false, error: 'forbidden' });

  let data;
  try { data = await request.json(); } catch { return json(400, { ok: false, error: 'invalid_json' }); }
  if (!data || typeof data !== 'object') return json(400, { ok: false, error: 'invalid_json' });

  // Honeypot: a real visitor never fills this in. Pretend it worked, send nothing.
  if (clean(data.company_url, 200)) return json(200, { ok: true });

  const kind = KINDS[data.kind] ? data.kind : 'general';
  const spec = KINDS[kind];
  const values = {}, fields = {};
  for (const [key, label, rule, required] of spec.fields) {
    if (Array.isArray(rule)) {
      values[key] = (Array.isArray(data[key]) ? data[key] : []).filter(v => rule.includes(v));
      continue;
    }
    values[key] = key === 'message' ? clean(data[key], rule) : oneLine(data[key], rule);
    if (required && !values[key]) fields[key] = required;
  }
  if (values.email && !EMAIL.test(values.email)) fields.email = 'Enter an email address in the format name@example.com.';
  if (Object.keys(fields).length) return json(422, { ok: false, error: 'validation', fields });

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) {
    console.error('UNNATE enquiry: RESEND_API_KEY and ENQUIRY_TO must be set — the enquiry was NOT delivered.');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const lines = spec.fields.filter(([k]) => k !== 'message').map(([k, label]) => {
    const v = values[k];
    return `${label}: ${(Array.isArray(v) ? v.join(', ') : v) || '—'}`;
  });
  const text = [`${spec.subject}`, '', ...lines, '', `${spec.fields.find(f => f[0] === 'message')[1]}:`, values.message, '',
    `Sent from ${new URL(request.url).host}${oneLine(data.page, 200)}`].join('\n');
  const who = values.company || values.clinic || values.college;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM || 'UNNATE Website <onboarding@resend.dev>',
        to: [env.ENQUIRY_TO],
        reply_to: values.email,
        subject: `${spec.subject} — ${values.name}${who ? ` (${who})` : ''}`,
        text
      })
    });
  } catch (err) {
    console.error('UNNATE enquiry: could not reach Resend', err);
    return json(502, { ok: false, error: 'delivery_failed' });
  }
  if (!res.ok) {
    console.error('UNNATE enquiry: Resend rejected the email', res.status, await res.text());
    return json(502, { ok: false, error: 'delivery_failed' });
  }
  return json(200, { ok: true });
}

// Anything other than POST.
export const onRequest = () => json(405, { ok: false, error: 'method_not_allowed' });
