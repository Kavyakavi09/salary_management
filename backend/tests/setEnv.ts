process.env.NODE_ENV = "test";
// File-based SQLite for tests — never uses Postgres
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRY = "1d";
