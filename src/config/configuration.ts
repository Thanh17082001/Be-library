export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  mail: {
    MAILGUN_API_KEY: 'e426a3fe7f079b433b78afc01c4b5007-d010bdaf-d94ca66e',
    MAILGUN_DOMAIN: 'sandboxecdb0d491d9f4483a2f47ee90a620c9c.mailgun.org',
  },
});
