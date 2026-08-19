const { getMailer } = require('../config/mailer');
const { env } = require('../config/env');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendNewLeadEmail(lead) {
  const mailer = getMailer();
  if (!mailer || !env.smtp.adminEmail) return { delivered: false, reason: 'mail_not_configured' };

  const requestLabel = lead.engineerCode || 'General quote';
  const subject = `New ॠKABH Request — ${requestLabel}`;
  const text = [
    'New customer request received.',
    `Reference: ${lead.leadCode}`,
    `Engineer: ${requestLabel}`,
    `Customer: ${lead.customerName}`,
    `Phone: ${lead.phone}`,
    `City: ${lead.city}`,
    `Project: ${lead.projectType}`,
    `Open Admin Dashboard: ${env.adminDashboardUrl}`,
  ].join('\n');

  const html = `
    <h2>New customer request received</h2>
    <p><strong>Reference:</strong> ${escapeHtml(lead.leadCode)}</p>
    <p><strong>Engineer:</strong> ${escapeHtml(requestLabel)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(lead.customerName)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
    <p><strong>City:</strong> ${escapeHtml(lead.city)}</p>
    <p><strong>Project:</strong> ${escapeHtml(lead.projectType)}</p>
    <p><a href="${escapeHtml(env.adminDashboardUrl)}">Open Admin Dashboard</a></p>
  `;

  const info = await mailer.sendMail({
    from: env.smtp.from,
    to: env.smtp.adminEmail,
    subject,
    text,
    html,
  });
  return { delivered: true, messageId: info.messageId };
}

module.exports = { sendNewLeadEmail, escapeHtml };
