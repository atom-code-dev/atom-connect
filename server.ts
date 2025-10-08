// server.ts - Next.js Standalone Server
import { createServer } from 'http';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Custom server without Socket.IO
async function createCustomServer() {
  try {
    // Set working directory to project root
    process.chdir(__dirname);
    
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: __dirname,
      hostname: hostname,
      port: currentPort
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server for Next.js
    const server = createServer(async (req, res) => {
      // Set proper headers for chunk loading
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      handle(req, res);
    });

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Working directory: ${process.cwd()}`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();