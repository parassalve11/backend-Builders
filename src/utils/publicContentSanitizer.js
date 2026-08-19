const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g;

function sanitizePublicText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(EMAIL_PATTERN, '[contact protected]')
    .replace(PHONE_PATTERN, '[contact protected]')
    .trim();
}

module.exports = { sanitizePublicText };
