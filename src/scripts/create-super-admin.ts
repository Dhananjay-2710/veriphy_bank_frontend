// Script to create a super admin user in the database
// Run this script to set up the initial super admin user

import { supabase } from '../supabase-client';

async function createSuperAdmin() {
  try {
    console.log('Creating super admin user...');
    
    // Check if super admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'superadmin@veriphy.com')
      .single();

    if (existingUser) {
      console.log('Super admin user already exists:', existingUser);
      return existingUser;
    }

    // Create super admin user
    const { data: userData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          full_name: 'Super Admin',
          email: 'superadmin@veriphy.com',
          mobile: '+91-9999999999',
          role: 'super_admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();

    if (insertError) {
      console.error('Error creating super admin:', insertError);
      throw insertError;
    }

    console.log('Super admin user created successfully:', userData);
    return userData[0];
  } catch (error) {
    console.error('Failed to create super admin:', error);
    throw error;
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('✅ Super admin setup complete!');
    console.log('You can now login with: superadmin@veriphy.com (any password)');
  })
  .catch((error) => {
    console.error('❌ Super admin setup failed:', error);
  });
