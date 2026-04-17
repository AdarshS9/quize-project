const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { client, initDb } = require('./db');

const seed = async () => {
  console.log('--- Initializing Database & Seeding Accounts ---');
  try {
    await initDb();
    
    const usersToSeed = [
      { name: 'System Administrator', email: 'admin@exampro.com', pass: 'admin123', role: 'ADMIN' },
      { name: 'Adarsh Student', email: 'adarsh@student.com', pass: 'student123', role: 'STUDENT' },
      { name: 'Rahul Kumar', email: 'rahul@student.com', pass: 'rahul123', role: 'STUDENT' },
      { name: 'Sneha Patel', email: 'sneha@student.com', pass: 'sneha123', role: 'STUDENT' },
    ];

    for (const u of usersToSeed) {
      const check = await client.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [u.email]
      });

      if (check.rows.length === 0) {
        const hashed = await bcrypt.hash(u.pass, 10);
        await client.execute({
          sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
          args: [uuidv4(), u.name, u.email, hashed, u.role]
        });
        console.log(`✅ Table Created: ${u.role} - Name: ${u.name}`);
        console.log(`   User: ${u.email} / Pass: ${u.pass}`);
        console.log('-----------------------------------');
      } else {
        console.log(`ℹ️ Skipping: User ${u.email} already exists.`);
      }
    }

    console.log('\n✨ Database seeding complete! You can now login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
