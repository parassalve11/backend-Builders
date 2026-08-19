const test = require('node:test');
const assert = require('node:assert/strict');
const { toPublicProject } = require('../src/utils/publicProjectSerializer');

test('public project DTO omits customer, cost, address, and internal remarks', () => {
  const result = toPublicProject(
    {
      _id: 'internal-id',
      projectCode: 'KABH-PROJ-0102',
      engineer: { _id: 'engineer-id', pseudonymCode: 'ENG-YVT-01', fullName: 'Private Name' },
      customerName: 'Private Customer',
      customerPhone: '9876543210',
      constructionLocation: 'Exact private address',
      estimatedCost: 5000000,
      internalNotes: 'Private note',
      publicLocation: 'Yavatmal district',
      status: 'active',
      overallProgress: 42,
    },
    [
      {
        name: 'structure',
        status: 'in_progress',
        progress: 42,
        engineerRemarks: 'Private engineer remark',
        adminRemarks: 'Private admin remark',
        customerUpdate: 'Safe update',
        customerVisible: true,
      },
      { name: 'brickwork', customerVisible: false, customerUpdate: 'Not approved' },
    ],
  );
  const json = JSON.stringify(result);
  for (const forbidden of [
    'Private Name',
    'Private Customer',
    '9876543210',
    'Exact private address',
    '5000000',
    'Private note',
    'Private engineer remark',
    'Private admin remark',
    'Not approved',
  ]) {
    assert.equal(json.includes(forbidden), false, `public project JSON leaked ${forbidden}`);
  }
  assert.equal(result.engineerCode, 'ENG-YVT-01');
  assert.equal(result.stages.length, 1);
});
