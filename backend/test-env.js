// backend/test-env.js
const dotenv = require('dotenv');
const path = require('path'); // Import path module

// Try loading .env from the project root explicitly
// process.cwd() when run via 'node backend/test-env.js' from root should be the root directory
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

console.log('--- Environment Variables in test-env.js ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : undefined);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('------------------------------------------'); 