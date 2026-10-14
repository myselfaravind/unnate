/* UNNATE — the only values the business owner needs to edit.
   Leave a value as '' and the site simply doesn't show that link. Never invent one. */
window.UNNATE_CONFIG = {
  // The studio's two customer-facing email addresses. Both appear on every contact card and in the footer,
  // and every enquiry form is delivered to both: to the first, with the second copied in (CC).
  emails: ['aravind@unnate.com', 'saran@unnate.com'],

  // Enquiries are delivered by FormSubmit (https://formsubmit.co), free, with no account or API key.
  // After the first enquiry FormSubmit emails the first address an activation link; see DEPLOY.md.
  // Optional: once activated, FormSubmit also sends a random string that can stand in for the address in the
  // form endpoint. Paste it here to use it; leave '' to post to the first address above.
  formsubmitAlias: '',

  // Verified social links only. Leave '' to hide.
  instagram: '',   // e.g. 'https://www.instagram.com/your-handle/'
  linkedin: '',    // e.g. 'https://www.linkedin.com/company/your-page/'

  // Link to a real privacy policy, if one exists.
  privacyUrl: ''
};
