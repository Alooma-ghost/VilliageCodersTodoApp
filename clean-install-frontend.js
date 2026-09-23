const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (fs.existsSync(nodeModules)) {
  console.log('Cleaning corrupted frontend node_modules...');
  fs.rmSync(nodeModules, { recursive: true, force: true });
}

console.log('Installing clean frontend packages...');
execSync('npm.cmd install --loglevel=error', {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
});
console.log('✅ Clean frontend install complete!');
