const path   = require('path');
const dotenv = require('dotenv');
// Load server/.env first, fall back to repo-root .env (monorepo layout)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Note: Using default system DNS for MongoDB Atlas SRV resolution
const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

(async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Neurix AI server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${PORT} is already in use. Please kill the existing process and restart.`);
    } else {
      console.error(`[ERROR] Server error:`, err);
    }
  });
})();
