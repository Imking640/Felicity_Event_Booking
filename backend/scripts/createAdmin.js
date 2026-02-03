#!/usr/bin/env node
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Admin } = require('../models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('\n💡 Use this email to login as admin');
      process.exit(0);
    }

    // Create admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@felicity.iiit.ac.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Create admin user
    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      adminName: 'System Administrator'
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n✅ You can now login with these credentials');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdminUser();
