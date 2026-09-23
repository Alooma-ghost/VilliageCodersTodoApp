const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install --no-audit --prefer-offline', {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });
  console.log('✅ Backend dependencies installed successfully!');
} catch (e) {
  console.error('❌ Backend install failed:', e.message);
}

console.log('📦 Installing frontend dependencies...');
try {
  execSync('npm install --no-audit --prefer-offline', {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });
  console.log('✅ Frontend dependencies installed successfully!');
} catch (e) {
  console.error('❌ Frontend install failed:', e.message);
}
