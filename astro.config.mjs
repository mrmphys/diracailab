import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://diracailab.com',
  integrations: [tailwind()],
  server: { host: '0.0.0.0' },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['diracailab.com', 'dirac-ai-lab-production.up.railway.app', 'all'],
  },
  vite: {
    preview: {
      allowedHosts: true,
    },
  },
});
