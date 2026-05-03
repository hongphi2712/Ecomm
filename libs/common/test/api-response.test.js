const assert = require('node:assert/strict');

const response = {
  success: true,
  message: 'OK',
  data: { id: '1' }
};

assert.equal(response.success, true);
assert.equal(response.message, 'OK');
assert.deepEqual(response.data, { id: '1' });

console.log('api response smoke test passed');
