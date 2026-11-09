import { mkdir, copyFile, cp } from 'node:fs/promises';

// Only public site files enter the deployment artifact.
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await cp('assets', 'dist/assets', { recursive: true });
console.log('Built static site in dist/');
