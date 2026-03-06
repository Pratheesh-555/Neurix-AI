require('dotenv').config();
const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`BCBA Copilot server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
})();
