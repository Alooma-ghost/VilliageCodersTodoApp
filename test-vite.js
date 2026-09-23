const fs = require('fs');
const path = require('path');

const vitePkgPath = path.join(__dirname, 'frontend', 'node_modules', 'vite', 'package.json');
if (fs.existsSync(vitePkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(vitePkgPath, 'utf8'));
  console.log('✅ Vite version installed:', pkg.version);
} else {
  console.log('❌ Vite package.json not found');
}
