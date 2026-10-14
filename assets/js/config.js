/* UNNATE — the only values the business owner needs to edit.
   Leave a value as '' and the site simply doesn't show that link. Never invent one. */
window.UNNATE_CONFIG = {
  // Where every enquiry form posts. The default is the Cloudflare Pages Function in /functions/api/enquiry.js.
  // To use a form service instead, paste its full https:// endpoint here. It must accept a JSON POST and
  // answer with JSON containing "ok": true, or the site will (correctly) say the enquiry wasn't sent.
  enquiryEndpoint: '/api/enquiry',

  // Verified public contact details only. Each one appears on the contact cards and in the footer once filled in.
  email: '',       // e.g. 'hello@unnate.com'
  phone: '',       // e.g. '+91 98765 43210'
  whatsapp: '',    // the WhatsApp number, with country code, e.g. '+91 98765 43210'
  instagram: '',   // e.g. 'https://www.instagram.com/your-handle/'
  linkedin: '',    // e.g. 'https://www.linkedin.com/company/your-page/'

  // Link to a real privacy policy, if one exists.
  privacyUrl: ''
};
