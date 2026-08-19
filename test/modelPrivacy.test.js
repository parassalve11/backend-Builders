const test = require('node:test');
const assert = require('node:assert/strict');
const Engineer = require('../src/models/Engineer');
const AdminUser = require('../src/models/AdminUser');
const LeadRequest = require('../src/models/LeadRequest');
const Project = require('../src/models/Project');
const {
  PUBLIC_ENGINEER_FIELDS,
  PUBLIC_PORTFOLIO_FIELDS,
} = require('../src/services/engineerService');
const { PUBLIC_PROJECT_FIELDS, PUBLIC_STAGE_FIELDS } = require('../src/services/projectService');

test('identity and customer fields are private-by-default at the Mongoose layer', () => {
  assert.equal(AdminUser.schema.path('password').options.select, false);
  assert.equal(AdminUser.schema.path('tokenVersion').options.select, false);
  for (const path of [
    'fullName',
    'phone',
    'alternatePhone',
    'email',
    'exactAddress',
    'profilePhoto',
    'emergencyContact',
    'employeePartnerId',
    'internalNotes',
    'licenseDetails',
    'verificationStatus',
  ]) {
    assert.equal(Engineer.schema.path(path).options.select, false, `Engineer.${path} must default private`);
  }
  for (const path of ['customerName', 'phone', 'email', 'projectDetails', 'budgetRange', 'adminNotes']) {
    assert.equal(LeadRequest.schema.path(path).options.select, false, `LeadRequest.${path} must default private`);
  }
  for (const path of [
    'customerName',
    'customerPhone',
    'customerEmail',
    'constructionLocation',
    'estimatedCost',
    'finalCost',
    'internalNotes',
  ]) {
    assert.equal(Project.schema.path(path).options.select, false, `Project.${path} must default private`);
  }
});

test('public database projections contain no known private paths', () => {
  const combined = [
    PUBLIC_ENGINEER_FIELDS,
    PUBLIC_PORTFOLIO_FIELDS,
    PUBLIC_PROJECT_FIELDS,
    PUBLIC_STAGE_FIELDS,
  ].join(' ');
  for (const forbidden of [
    'fullName',
    'phone',
    'email',
    'exactAddress',
    'customerName',
    'constructionLocation',
    'estimatedCost',
    'internalNotes',
    'adminRemarks',
    'engineerRemarks',
    'fileUrl',
  ]) {
    assert.equal(combined.split(/\s+/).includes(forbidden), false, `projection includes ${forbidden}`);
  }
});
