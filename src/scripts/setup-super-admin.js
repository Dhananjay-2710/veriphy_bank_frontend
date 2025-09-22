// Simple script to create super admin user
// Run this in your browser console or as a Node.js script

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin User...');
    
    // Create the super admin user
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        full_name: 'Super Admin',
        email: 'superadmin@veriphy.com',
        mobile: '+91-9999999999',
        role: 'super_admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('✅ Super Admin created successfully!');
      console.log('📧 Email: superadmin@veriphy.com');
      console.log('🔑 Password: Any password (authentication bypassed for testing)');
      console.log('🌐 Login URL: http://localhost:5173/');
    } else {
      const error = await response.text();
      console.error('❌ Error creating super admin:', error);
    }
  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
  }
}

// Run the function
createSuperAdmin();
