import dotenv from 'dotenv';
import path from 'path';

// Determine the root path (assuming this runs from dist/config/env.js)
// Adjust if your structure differs significantly
const rootPath = path.resolve(__dirname, '..', '..', '..');
const envPath = path.resolve(rootPath, '.env');

console.log(`Attempting to load .env from: ${envPath}`); // Debug log

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`ERROR loading .env file from ${envPath}:`, result.error);
  // Optionally exit if .env is critical and not found
  // process.exit(1);
} else {
  console.log(`.env file loaded successfully from ${envPath}`);
} 