// fixed-node-process.js
const http = require('http');

// CLI args
console.log('argv:', process.argv);

// (uncomment if you need env vars)
// console.log('env:', process.env);

// Current working directory and PID
console.log('cwd:', process.cwd());
console.log('pid:', process.pid);

// microtask example
process.nextTick(() => {
  console.log('Tiny callback first!');
});

// memory usage snapshot
console.log('memoryUsage:', process.memoryUsage());

// exit handler — only synchronous work here
process.on('exit', (code) => {
  console.log(`Goodbye, world. exit code: ${code}`);
});

// create a simple HTTP server
const server = http.createServer((req, res) => {
  // respond with proper headers
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Hello!\n');
});

// server error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

// start listening
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (pid: ${process.pid})`);
});

// graceful shutdown on common signals (SIGINT, SIGTERM)
// NOTE: SIGKILL cannot be caught or handled by a process — removed
function shutdown(signal) {
  console.log(`${signal} received — shutting down gracefully...`);
  // stop accepting new connections, finish existing ones
  server.close(() => {
    console.log('Closed remaining connections. Exiting.');
    process.exit(0);
  });

  // force exit if close takes too long
  setTimeout(() => {
    console.error('Could not close connections in time, forcing exit.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // kill/terminate

// safety nets for uncaught errors / promise rejections
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  // attempt graceful shutdown then exit
  try { server.close(); } catch (e) {}
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
  // best practice: fail fast in unknown promise-rejection state
  process.exit(1);
});
