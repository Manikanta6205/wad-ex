const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log('Generated JWT_SECRET:');
console.log(secret);
console.log('\nYou can now use this secret in your application.');
