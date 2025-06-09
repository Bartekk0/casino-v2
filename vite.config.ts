import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // server: {
  //   https: {
  //     key: fs.readFileSync(path.resolve('./certs/localhost-key.pem')),
  //     cert: fs.readFileSync(path.resolve('./certs/localhost.pem'))
  //   }
  // }
});