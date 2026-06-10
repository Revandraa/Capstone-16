import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Serve pmk_labelled folder as static assets during development
    fs: {
      allow: ['.'],
    },
  },
  // Make pmk_labelled accessible as /pmk_labelled/* in the dev server
  publicDir: 'public',
  plugins: [
    {
      name: 'serve-pmk-labelled',
      configureServer(server) {
        // Serve pmk_labelled as static files
        server.middlewares.use('/pmk_labelled', (req, res, next) => {
          const filePath = path.join(__dirname, 'pmk_labelled', decodeURIComponent(req.url));
          import('fs').then(fs => {
            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
              fs.createReadStream(filePath).pipe(res);
            } else {
              next();
            }
          });
        });
      },
    },
  ],
});
