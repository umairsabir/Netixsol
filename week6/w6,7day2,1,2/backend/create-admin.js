const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const URI = 'mongodb+srv://umair:11223344@cluster0.y6bxovc.mongodb.net/ecommerce-loyalty';

async function createAdmin() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db('ecommerce-loyalty');

    const email = 'admin@admin.com';
    const password = 'Admin@123';

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log('Admin already exists! Email:', email);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      name: 'Admin',
      email,
      passwordHash,
      role: 'admin',
      points: 0,
      refreshToken: null,
      provider: 'local',
      providerId: null,
      avatar: null,
      authIdentities: [],
      loginActivity: [],
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

createAdmin();
