const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../src/app');

test('health endpoint loads without a database connection and sends security headers', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('invalid public inputs stop at validation before reaching data access', async () => {
  const leadResponse = await request(app)
    .post('/api/leads')
    .send({ customerName: 'A', consentToContact: false })
    .expect(422);
  assert.equal(leadResponse.body.success, false);
  assert.equal(leadResponse.body.message, 'Request validation failed');

  const engineerResponse = await request(app).get('/api/engineers/not-a-code').expect(422);
  assert.equal(engineerResponse.body.success, false);
});

test('admin resources reject missing bearer authentication', async () => {
  const response = await request(app).get('/api/admin/dashboard').expect(401);
  assert.deepEqual(response.body, { success: false, message: 'Authentication required' });
});

test('CORS rejects origins outside the configured frontend allowlist', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'https://attacker.example')
    .expect(403);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Origin is not allowed by CORS');
});
