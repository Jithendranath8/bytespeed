const app = require('./index');
const prisma = require('./prisma/prisma');

const PORT = process.env.DB_PORT || 8080;

(async () => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

