/* UNNATE — the only values the business owner needs to edit.
   Leave a value as '' and the site simply doesn't show that link. Never invent one. */
window.UNNATE_CONFIG = {
  // Where every enquiry form posts. The default is the Cloudflare Pages Function in /functions/api/enquiry.js.
  // To use a form service instead, paste its full https:// endpoint here. It must accept a JSON POST and
  // answer with JSON containing "ok": true, or the site will (correctly) say the enquiry wasn't sent.
  enquiryEndpoint: '/api/enquiry',

  // The studio's two customer-facing email addresses. Both appear on every contact card and in the footer.
  // (Where enquiries are *delivered* is set separately, on the server: ENQUIRY_TO, see DEPLOY.md.)
  emails: ['', ''],   // e.g. ['hello@unnate.com', 'projects@unnate.com']

  // Verified social links only. Leave '' to hide.
  instagram: '',   // e.g. 'https://www.instagram.com/your-handle/'
  linkedin: '',    // e.g. 'https://www.linkedin.com/company/your-page/'

  // Link to a real privacy policy, if one exists.
  privacyUrl: ''
};
