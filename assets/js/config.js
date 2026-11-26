/* UNNATE — the only values the business owner needs to edit.
   Leave a value as '' and the site simply doesn't show that link. Never invent one. */
window.UNNATE_CONFIG = {
  // The studio's customer-facing email addresses. Both appear on every contact card and in the footer.
  // The first one receives every "Let's talk" email (tools/site/build.py reads it when it builds the pages).
  emails: ['aravind@unnate.com', 'saran@unnate.com'],

  // Verified social links only. Leave '' to hide.
  instagram: '',   // e.g. 'https://www.instagram.com/your-handle/'
  linkedin: '',    // e.g. 'https://www.linkedin.com/company/your-page/'

  // Link to a real privacy policy, if one exists.
  privacyUrl: ''
};
