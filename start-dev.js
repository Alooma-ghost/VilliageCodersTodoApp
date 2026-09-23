const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('========================================================');
console.log(' 🚀 Starting Village Coders Todo & Task Application ');
console.log('========================================================');

const nodeExec = process.execPath;
const serverScript = path.join(backendDir, 'src', 'server.js');
const viteScript = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

// Start backend
console.log('Starting Backend on http://localhost:5000...');
const backend = spawn(nodeExec, [serverScript], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false,
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend:', err.message);
});

// Start frontend
console.log('Starting Frontend on http://localhost:5173...');
const frontend = spawn(nodeExec, [viteScript, '--host', '--port', '5173'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: false,
});

frontend.on('error', (err) => {
  console.error('❌ Failed to start frontend:', err.message);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down Village Coders services...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
