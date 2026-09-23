const { spawnSync } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
console.log('Starting frontend install in:', frontendDir);

const result = spawnSync('npm.cmd', ['install', '--loglevel=error'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'inherit',
});

console.log('Frontend install exited with code:', result.status);
