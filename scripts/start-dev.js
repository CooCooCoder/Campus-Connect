const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log(' Starting CampusConnect Development Servers...');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit'
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: 'inherit'
});

function cleanup() {
  console.log('\nShutting down dev servers...');
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
