import { preview } from 'astro';

const port = parseInt(process.env.PORT ?? process.env.RAILWAY_PORT ?? '8080');

console.log(`All env vars: PORT=${process.env.PORT} RAILWAY_PORT=${process.env.RAILWAY_PORT}`);
console.log(`Starting on port ${port}`);

const server = await preview({
  root: process.cwd(),
  server: { port, host: '0.0.0.0' },
  preview: { port, host: '0.0.0.0', allowedHosts: true },
});

console.log(`Server running on port ${port}`);
