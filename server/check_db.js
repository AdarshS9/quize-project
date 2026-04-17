const { createClient } = require('@libsql/client');
require('dotenv').config();

async function check() {
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN
  });
  console.log('--- EXAMS ---');
  const res1 = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='exams'");
  console.log(res1.rows[0]?.sql || 'Table not found');
  
  console.log('\n--- QUESTIONS ---');
  const res2 = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='questions'");
  console.log(res2.rows[0]?.sql || 'Table not found');
  
  process.exit(0);
}
check();
