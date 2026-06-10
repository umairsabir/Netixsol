// Enforces pnpm as the only allowed package manager.
// This script is called by the "preinstall" lifecycle hook.
// npm_execpath is set by whichever package manager invokes the install.
const execPath = process.env.npm_execpath || '';

if (!execPath.includes('pnpm')) {
  console.error('');
  console.error('\x1b[31m╔════════════════════════════════════════════╗\x1b[0m');
  console.error('\x1b[31m║   ERROR: Wrong package manager detected!   ║\x1b[0m');
  console.error('\x1b[31m╠════════════════════════════════════════════╣\x1b[0m');
  console.error('\x1b[31m║  This project requires pnpm.               ║\x1b[0m');
  console.error('\x1b[31m║  Please use:  pnpm install                 ║\x1b[0m');
  console.error('\x1b[31m╚════════════════════════════════════════════╝\x1b[0m');
  console.error('');
  process.exit(1);
}
