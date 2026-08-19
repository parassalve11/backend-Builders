const test = require('node:test');
const assert = require('node:assert/strict');
const { createLeadBodySchema } = require('../src/validators/leadValidators');

const baseLead = {
  customerName: 'Rahul Patil',
  phone: '+91 98765-43210',
  city: 'Yavatmal',
  projectType: 'Residential',
  projectDetails: 'Build a two-storey family home.',
  consentToContact: true,
};

test('general quote lead validates without an engineer code', () => {
  const result = createLeadBodySchema.safeParse({ ...baseLead, budgetRange: '₹35–45 lakh' });
  assert.equal(result.success, true);
  assert.equal(result.data.phone, '9876543210');
  assert.equal(result.data.consentToContact, true);
});

test('lead validation requires explicit contact consent', () => {
  const { consentToContact, ...withoutConsent } = baseLead;
  assert.equal(createLeadBodySchema.safeParse(withoutConsent).success, false);
  assert.equal(createLeadBodySchema.safeParse({ ...withoutConsent, consentToContact: false }).success, false);
});

test('engineer request validates with anonymous code and structured budget', () => {
  const result = createLeadBodySchema.safeParse({
    ...baseLead,
    engineerCode: 'eng-yvt-01',
    budgetRange: { min: 3500000, max: 4500000, currency: 'INR' },
  });
  assert.equal(result.success, true);
  assert.equal(result.data.engineerCode, 'ENG-YVT-01');
});

test('lead validation rejects invalid phone and short or empty project content', () => {
  const badPhone = createLeadBodySchema.safeParse({ ...baseLead, phone: '12345' });
  const shortDetails = createLeadBodySchema.safeParse({ ...baseLead, projectDetails: 'short' });
  assert.equal(badPhone.success, false);
  assert.equal(shortDetails.success, false);
});

test('lead validation strips unknown properties', () => {
  const result = createLeadBodySchema.parse({ ...baseLead, status: 'closed', adminNotes: 'injected' });
  assert.equal('status' in result, false);
  assert.equal('adminNotes' in result, false);
});
