import { supabase } from '../supabase-client';

// Sample data for testing dashboards
const sampleUsers = [
  {
    email: 'admin@veriphy.com',
    full_name: 'Admin User',
    mobile: '+91-9876543210',
    role: 'admin',
    status: 'active'
  },
  {
    email: 'manager@veriphy.com',
    full_name: 'Manager User',
    mobile: '+91-9876543211',
    role: 'manager',
    status: 'active'
  },
  {
    email: 'sales@veriphy.com',
    full_name: 'Sales Person',
    mobile: '+91-9876543212',
    role: 'salesperson',
    status: 'active'
  },
  {
    email: 'credit@veriphy.com',
    full_name: 'Credit Ops',
    mobile: '+91-9876543213',
    role: 'credit-ops',
    status: 'active'
  }
];

const sampleCustomers = [
  {
    full_name: 'Rajesh Kumar',
    mobile: '+91-9876543201',
    email: 'rajesh@example.com',
    dob: '1985-05-15',
    gender: 'male',
    marital_status: 'married',
    employment_type: 'salaried',
    risk_profile: 'low',
    kyc_status: 'verified',
    metadata: {
      monthly_income: 50000,
      address: 'Mumbai, Maharashtra'
    }
  },
  {
    full_name: 'Priya Sharma',
    mobile: '+91-9876543202',
    email: 'priya@example.com',
    dob: '1990-08-22',
    gender: 'female',
    marital_status: 'single',
    employment_type: 'self-employed',
    risk_profile: 'medium',
    kyc_status: 'verified',
    metadata: {
      monthly_income: 75000,
      address: 'Delhi, NCR'
    }
  },
  {
    full_name: 'Amit Patel',
    mobile: '+91-9876543203',
    email: 'amit@example.com',
    dob: '1988-12-10',
    gender: 'male',
    marital_status: 'married',
    employment_type: 'salaried',
    risk_profile: 'low',
    kyc_status: 'in-progress',
    metadata: {
      monthly_income: 60000,
      address: 'Bangalore, Karnataka'
    }
  }
];

const sampleProducts = [
  {
    name: 'Home Loan',
    code: 'HL001',
    description: 'Home loan product',
    metadata: {
      min_amount: 500000,
      max_amount: 10000000,
      interest_rate: 8.5
    }
  },
  {
    name: 'Personal Loan',
    code: 'PL001',
    description: 'Personal loan product',
    metadata: {
      min_amount: 50000,
      max_amount: 2000000,
      interest_rate: 12.5
    }
  },
  {
    name: 'Car Loan',
    code: 'CL001',
    description: 'Car loan product',
    metadata: {
      min_amount: 200000,
      max_amount: 5000000,
      interest_rate: 9.5
    }
  }
];

const sampleCases = [
  {
    case_number: 'CASE-001',
    customer_id: 1,
    product_id: 1,
    title: 'Home Loan Application',
    description: 'Home loan for property purchase',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 2,
    metadata: {
      requested_amount: 5000000,
      requested_tenure: 240
    }
  },
  {
    case_number: 'CASE-002',
    customer_id: 2,
    product_id: 2,
    title: 'Personal Loan Application',
    description: 'Personal loan for education',
    status: 'pending',
    priority: 'medium',
    assigned_to: 3,
    metadata: {
      requested_amount: 500000,
      requested_tenure: 60
    }
  },
  {
    case_number: 'CASE-003',
    customer_id: 3,
    product_id: 3,
    title: 'Car Loan Application',
    description: 'Car loan for vehicle purchase',
    status: 'closed',
    priority: 'low',
    assigned_to: 3,
    metadata: {
      requested_amount: 800000,
      requested_tenure: 84
    }
  }
];

const sampleDocuments = [
  {
    customer_id: 1,
    document_type_id: 1,
    status: 'pending',
    metadata: {
      file_name: 'pan_card.pdf',
      file_type: 'pdf'
    }
  },
  {
    customer_id: 1,
    document_type_id: 2,
    status: 'verified',
    submitted_at: new Date().toISOString(),
    metadata: {
      file_name: 'aadhaar_card.pdf',
      file_type: 'pdf'
    }
  },
  {
    customer_id: 2,
    document_type_id: 1,
    status: 'pending',
    metadata: {
      file_name: 'pan_card_priya.pdf',
      file_type: 'pdf'
    }
  }
];

const sampleTasks = [
  {
    title: 'Follow up with Rajesh Kumar',
    description: 'Call customer for missing documents',
    priority: 'high',
    status: 'open',
    assigned_to: 2,
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      customer_name: 'Rajesh Kumar',
      customer_phone: '+91-9876543201'
    }
  },
  {
    title: 'Review Priya Sharma documents',
    description: 'Review submitted documents for verification',
    priority: 'medium',
    status: 'open',
    assigned_to: 4,
    due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    metadata: {
      customer_name: 'Priya Sharma',
      customer_phone: '+91-9876543202'
    }
  }
];

export async function populateSampleData() {
  console.log('Starting to populate sample data...');

  try {
    // Insert users
    console.log('Inserting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (usersError) {
      console.error('Error inserting users:', usersError);
    } else {
      console.log('Users inserted:', users?.length);
    }

    // Insert customers
    console.log('Inserting customers...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert(sampleCustomers)
      .select();

    if (customersError) {
      console.error('Error inserting customers:', customersError);
    } else {
      console.log('Customers inserted:', customers?.length);
    }

    // Insert products
    console.log('Inserting products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (productsError) {
      console.error('Error inserting products:', productsError);
    } else {
      console.log('Products inserted:', products?.length);
    }

    // Insert cases
    console.log('Inserting cases...');
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .insert(sampleCases)
      .select();

    if (casesError) {
      console.error('Error inserting cases:', casesError);
    } else {
      console.log('Cases inserted:', cases?.length);
    }

    // Insert documents
    console.log('Inserting documents...');
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .insert(sampleDocuments)
      .select();

    if (documentsError) {
      console.error('Error inserting documents:', documentsError);
    } else {
      console.log('Documents inserted:', documents?.length);
    }

    // Insert tasks
    console.log('Inserting tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(sampleTasks)
      .select();

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
    } else {
      console.log('Tasks inserted:', tasks?.length);
    }

    console.log('Sample data population completed!');
    return true;

  } catch (error) {
    console.error('Error populating sample data:', error);
    return false;
  }
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
  // Browser environment - expose function globally
  (window as any).populateSampleData = populateSampleData;
}
