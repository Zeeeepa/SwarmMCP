// This script adds .cjs extension to CommonJS require statements
// and creates proper package.json files for dual ESM/CJS support

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const cjsDir = path.resolve(rootDir, 'dist/cjs');

// Create package.json files for CJS modules
function createPackageJson(dir) {
  const packageJson = {
    type: 'commonjs'
  };
  
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Process all JS files in the CJS directory
function processDirectory(dir) {
  createPackageJson(dir);
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.js')) {
      // Rename index.js files to index.cjs
      if (entry.name === 'index.js') {
        fs.renameSync(fullPath, path.join(dir, 'index.cjs'));
      }
    }
  }
}

// Start processing from the CJS root directory
processDirectory(cjsDir);

console.log('Post-build CJS processing completed successfully.');

