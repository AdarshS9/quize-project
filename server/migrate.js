const { createClient } = require('@libsql/client');
require('dotenv').config();

const migrate = async () => {
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  console.log('Starting migration...');

  try {
    // Check existing columns
    const info = await client.execute('PRAGMA table_info(exams)');
    const columns = info.rows.map(r => r.name);

    if (!columns.includes('subject')) {
      console.log('Adding subject column...');
      await client.execute('ALTER TABLE exams ADD COLUMN subject TEXT');
    }
    if (!columns.includes('date')) {
      console.log('Adding date column...');
      await client.execute('ALTER TABLE exams ADD COLUMN date TEXT');
    }
    if (!columns.includes('total_marks')) {
      console.log('Adding total_marks column...');
      await client.execute('ALTER TABLE exams ADD COLUMN total_marks INTEGER DEFAULT 0');
    }
    if (!columns.includes('status')) {
      console.log('Adding status column...');
      await client.execute("ALTER TABLE exams ADD COLUMN status TEXT DEFAULT 'published'");
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
};

migrate();
