import { preview } from 'astro';

const port = parseInt(process.env.PORT || '4321');

const server = await preview({
  root: process.cwd(),
  server: { port, host: '0.0.0.0' },
});

console.log(`Server running on port ${port}`);
