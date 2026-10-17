const { spawn } = require('node:child_process');
const electron = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.'], {
  env,
  stdio: 'inherit'
});

child.on('close', code => process.exit(code ?? 1));
