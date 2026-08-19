const test = require('node:test');
const assert = require('node:assert/strict');
const { containsMongoOperator } = require('../src/middlewares/sanitizeInput');

test('mongo operator detector rejects nested query operators and dotted keys', () => {
  assert.equal(containsMongoOperator({ email: { $ne: null } }), true);
  assert.equal(containsMongoOperator({ 'profile.role': 'admin' }), true);
  assert.equal(containsMongoOperator({ safe: ['value', { $where: 'danger' }] }), true);
  assert.equal(containsMongoOperator({ city: 'Yavatmal', filters: { rating: 4 } }), false);
});
