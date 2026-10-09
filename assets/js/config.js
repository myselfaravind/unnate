/* UNNATE — the only values the business owner needs to edit.
   Leave a value as '' and the site simply doesn't show that link. Never invent one. */
window.UNNATE_CONFIG = {
  // Where the enquiry form posts. The default is the Cloudflare Pages Function in /functions/api/enquiry.js.
  // To use a form service instead (e.g. Formspree), paste its full https:// endpoint here.
  enquiryEndpoint: 'api/enquiry',

  // Verified public links only.
  instagram: '',   // e.g. 'https://www.instagram.com/your-handle/'
  linkedin: '',    // e.g. 'https://www.linkedin.com/company/your-page/'
  email: '',       // e.g. 'hello@your-domain.com'

  // Link to a real privacy policy, if one exists.
  privacyUrl: ''
};
