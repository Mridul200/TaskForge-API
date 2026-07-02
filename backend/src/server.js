const app = require('./app');
require('dotenv').config();

const REQUIRED_ENV = ['JWT_SECRET', 'DB_PASSWORD'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`CRITICAL ERROR: Environment variable "${key}" is missing.`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});

