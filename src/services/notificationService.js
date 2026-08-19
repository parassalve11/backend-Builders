const { sendNewLeadEmail } = require('./emailService');

async function notifyNewLead(lead) {
  try {
    return await sendNewLeadEmail(lead);
  } catch (error) {
    // Log only the anonymous reference; never log customer or engineer identity details.
    console.error(`Lead notification failed for ${lead.leadCode}: ${error.message}`);
    return { delivered: false, reason: 'delivery_failed' };
  }
}

module.exports = { notifyNewLead };
