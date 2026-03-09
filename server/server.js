const path   = require('path');
const dotenv = require('dotenv');
// Load server/.env first, fall back to repo-root .env (monorepo layout)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force Google DNS — local DNS refuses SRV record lookups needed by mongodb+srv://
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Neurix AI server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
})();
