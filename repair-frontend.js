const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting frontend dependency repair...');

const frontendDir = path.join(__dirname, 'frontend');

// Remove package-lock.json in frontend if exists
const lockFile = path.join(frontendDir, 'package-lock.json');
if (fs.existsSync(lockFile)) {
  try {
    fs.unlinkSync(lockFile);
    console.log('Removed stale frontend package-lock.json');
  } catch (e) {
    console.log('Could not remove lockfile:', e.message);
  }
}

// Run npm install with --prefer-offline --no-audit --no-fund
console.log('Spawning npm.cmd install in frontend...');
const npm = spawn('npm.cmd', ['install', '--prefer-offline', '--no-audit', '--no-fund', '--verbose'], {
  cwd: frontendDir,
  shell: true,
});

npm.stdout.on('data', (d) => process.stdout.write(d.toString()));
npm.stderr.on('data', (d) => process.stderr.write(d.toString()));

npm.on('close', (code) => {
  console.log(`\nNPM install exited with code: ${code}`);
  process.exit(code || 0);
});

npm.on('error', (err) => {
  console.error('Failed to spawn npm:', err);
  process.exit(1);
});
