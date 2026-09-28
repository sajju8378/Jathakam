import { spawn } from 'child_process';

console.log('[DevRunner] Starting JyotishVeda FastAPI Astro Engine on port 8001...');
const apiProcess = spawn('python3', ['-m', 'uvicorn', 'api.main:app', '--host', '127.0.0.1', '--port', '8001'], {
  stdio: 'inherit',
  env: { ...process.env, PYTHONUNBUFFERED: '1' }
});

console.log('[DevRunner] Starting Vite Dev Server on port 3000...');
const viteProcess = spawn('npx', ['vite', '--port', '3000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: process.env
});

const cleanup = () => {
  console.log('[DevRunner] Shutting down child processes...');
  apiProcess.kill();
  viteProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
