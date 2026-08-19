const test = require('node:test');
const assert = require('node:assert/strict');
const { toPublicEngineer } = require('../src/utils/publicEngineerSerializer');

test('public engineer DTO exposes only the anonymous allowlist', () => {
  const privateValue = 'TOP-SECRET-IDENTITY';
  const result = toPublicEngineer(
    {
      _id: '507f1f77bcf86cd799439011',
      pseudonymCode: 'ENG-YVT-01',
      fullName: privateValue,
      phone: '9876543210',
      alternatePhone: '9876543211',
      email: 'secret@example.com',
      exactAddress: 'House 9, Exact Street',
      employeePartnerId: 'EMP-99',
      internalNotes: privateValue,
      emergencyContact: { name: privateValue, phone: '9999999999' },
      verificationStatus: 'verified',
      city: 'Yavatmal',
      cityCode: 'YVT',
      engineerType: 'civil_engineer',
      yearsExperience: 7,
      ratePerSqFt: { min: 1450, max: 1800 },
      verified: true,
    },
    [
      {
        projectCode: 'PORT-01',
        projectName: 'Safe residence',
        privateClientName: privateValue,
        exactLocation: 'Exact client address',
        description: 'Call 9876543210 or secret@example.com',
        isPublicApproved: true,
      },
      {
        projectCode: 'PORT-PRIVATE',
        projectName: privateValue,
        isPublicApproved: false,
      },
    ],
  );

  const json = JSON.stringify(result);
  for (const forbidden of [
    'fullName',
    'phone',
    'email',
    'exactAddress',
    'employeePartnerId',
    'internalNotes',
    'emergencyContact',
    'privateClientName',
    'exactLocation',
    privateValue,
    '9876543210',
    'secret@example.com',
    'PORT-PRIVATE',
  ]) {
    assert.equal(json.includes(forbidden), false, `public JSON leaked ${forbidden}`);
  }
  assert.equal(result.pseudonymCode, 'ENG-YVT-01');
  assert.equal(result.portfolio.length, 1);
  assert.match(result.portfolio[0].description, /contact protected/);
});

test('portfolio entries require explicit public approval', () => {
  const result = toPublicEngineer(
    { pseudonymCode: 'ENG-YVT-01', verified: true },
    [{ projectCode: 'UNREVIEWED', projectName: 'Unreviewed item' }],
  );
  assert.deepEqual(result.portfolio, []);
});
