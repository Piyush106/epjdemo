// Editorial-board recruitment copy — shared between the landing page view (for
// display) and the server page (for FAQPage JSON-LD), so the structured data
// always matches the visible content. Plain data, safe to import anywhere.

export const BENEFITS: { title: string; text: string }[] = [
  { title: "Scholarly recognition", text: "Public listing on the EP Journals Group editorial board with your name, affiliation, and verified research identifiers (ORCID, Scopus)." },
  { title: "Shape your field", text: "Influence editorial direction, scope, and standards across six peer-reviewed open access journals." },
  { title: "Formal review record", text: "Verifiable editorial and peer-review contributions you can add to your ORCID, Web of Science, and academic profile." },
  { title: "Global scholarly network", text: "Collaborate with an international board of researchers across engineering, sciences, management, economics, and education." },
  { title: "Early access to research", text: "Read and assess new submissions in your area of expertise before publication." },
];

export const RESPONSIBILITIES: string[] = [
  "Conduct timely, constructive double-blind peer review of manuscripts within your area of expertise.",
  "Advise on editorial policy, journal scope, and publication standards.",
  "Help uphold research integrity and publication ethics in line with COPE-aligned policies.",
  "Recommend qualified reviewers and, where appropriate, encourage quality submissions.",
  "Declare conflicts of interest and maintain the confidentiality of the review process.",
];

export const ELIGIBILITY: string[] = [
  "A doctoral degree (PhD or equivalent) in a relevant discipline, or equivalent senior research standing.",
  "An active research and publication record in one or more of the journals' subject areas.",
  "Prior peer-review or editorial experience is valued but not mandatory for all roles.",
  "A verifiable scholarly profile — an ORCID iD and/or Scopus Author ID is strongly preferred.",
  "Willingness to review at least one manuscript per month and respond within agreed timelines.",
];

export const PROCESS: { step: string; text: string }[] = [
  { step: "Submit your application", text: "Complete the form below and upload your CV (PDF, DOC, or DOCX, up to 10 MB)." },
  { step: "Editorial screening", text: "Our editorial office reviews your qualifications, research profile, and fit with current needs." },
  { step: "Verification", text: "We confirm your identifiers (ORCID, Scopus, Web of Science) and publication record." },
  { step: "Decision & onboarding", text: "Shortlisted candidates are contacted by email with role details and onboarding information." },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "Who can apply to join the editorial board?",
    answer:
      "Researchers holding a doctoral degree (or equivalent senior research standing) with an active publication record in one of our subject areas — engineering and technology, economics and finance, management, natural sciences, social sciences, or education — are welcome to apply. A verifiable ORCID iD and/or Scopus Author ID is strongly preferred.",
  },
  {
    question: "Is there any payment or fee involved?",
    answer:
      "Editorial board membership is a voluntary scholarly service. There is no fee to apply and no payment for the role; it is recognised as an academic contribution that you can record on your ORCID and Web of Science profiles.",
  },
  {
    question: "How much time does the role require?",
    answer:
      "We ask board members to review at least one manuscript per month, though you set your own capacity during the application. Reviews are double-blind and typically requested within your specific area of expertise.",
  },
  {
    question: "Which journals will I be associated with?",
    answer:
      "The editorial board is common to all EP Journals Group journals. You may indicate your preferred journals in the application, but board members support the portfolio as a whole based on subject expertise.",
  },
  {
    question: "How will my application be reviewed?",
    answer:
      "Applications are screened by the editorial office against qualifications, research profile, and current board needs. We verify scholarly identifiers and publication records. Due to the volume of applications, only shortlisted candidates are contacted.",
  },
  {
    question: "How is my personal data handled?",
    answer:
      "Your details and CV are stored securely and used solely to assess your application for editorial board membership. They are accessible only to the editorial office, are never sold or shared with third parties, and can be deleted on request by emailing info@ep-journals.org.",
  },
];

export const PRIVACY_NOTE =
  "The information and CV you submit are used solely to evaluate your application to join the EP Journals Group editorial board. Data is stored securely, is accessible only to the editorial office, and is never sold or shared with third parties. You may request access to, correction of, or deletion of your data at any time by contacting info@ep-journals.org.";
