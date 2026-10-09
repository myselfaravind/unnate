/**
 * UNNATE — enquiry endpoint (Cloudflare Pages Function, served at /api/enquiry).
 *
 * Receives the website's enquiry form as JSON and emails it to the studio through Resend.
 * It answers { ok: true } only after Resend has accepted the email, so the site never
 * shows a success message for an enquiry that was not delivered.
 *
 * Set these in Cloudflare Pages → Settings → Variables and Secrets (never in the code):
 *   RESEND_API_KEY   (secret)  API key from https://resend.com/api-keys
 *   ENQUIRY_TO                 the inbox that should receive enquiries
 *   ENQUIRY_FROM     optional  e.g. "UNNATE Website <enquiries@your-domain.com>" — the domain must be
 *                              verified in Resend. Defaults to Resend's test sender, which can only
 *                              deliver to the email address that owns the Resend account.
 */
const SERVICES = ['Websites', 'Brand Identity', 'Content & Creative', 'Social Media', 'Digital Advertising', 'Not sure yet'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const name = oneLine(data.name, 120);
  const email = oneLine(data.email, 200);
  const company = oneLine(data.company, 160);
  const website = oneLine(data.website, 300);
  const message = clean(data.message, 5000);
  const services = (Array.isArray(data.services) ? data.services : []).filter(s => SERVICES.includes(s));

  const fields = {};
  if (!name) fields.name = 'Enter your name.';
  if (!email) fields.email = 'Enter your work email.';
  else if (!EMAIL.test(email)) fields.email = 'Enter an email address in the format name@company.com.';
  if (Object.keys(fields).length) return json(422, { ok: false, error: 'validation', fields });

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) {
    console.error('UNNATE enquiry: RESEND_API_KEY and ENQUIRY_TO must be set — the enquiry was NOT delivered.');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company or brand: ${company || '—'}`,
    `Website or social profile: ${website || '—'}`,
    `Needs help with: ${services.length ? services.join(', ') : '—'}`,
    '',
    'Project:',
    message || '—',
    '',
    `Sent from ${new URL(request.url).host}${oneLine(data.page, 200)}`
  ].join('\n');

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM || 'UNNATE Website <onboarding@resend.dev>',
        to: [env.ENQUIRY_TO],
        reply_to: email,
        subject: `New enquiry — ${name}${company ? ` (${company})` : ''}`,
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
