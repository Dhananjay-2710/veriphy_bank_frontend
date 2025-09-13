import { Case, User, Document, WhatsAppMessage, ComplianceLog } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@happybank.in',
    role: 'salesperson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@happybank.in',
    role: 'manager',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Anita Patel',
    email: 'anita.patel@happybank.in',
    role: 'credit-ops',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Dr. Suresh Krishnamurthy',
    email: 'suresh.krishnamurthy@happybank.in',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Aadhaar Card',
    type: 'identity',
    status: 'verified',
    required: true,
    uploadedAt: '2025-01-09T10:30:00Z',
    verifiedAt: '2025-01-09T11:15:00Z'
  },
  {
    id: 'doc2',
    name: 'PAN Card',
    type: 'identity',
    status: 'verified',
    required: true,
    uploadedAt: '2025-01-09T10:45:00Z',
    verifiedAt: '2025-01-09T11:20:00Z'
  },
  {
    id: 'doc3',
    name: 'Bank Statements (6 months)',
    type: 'financial',
    status: 'received',
    required: true,
    uploadedAt: '2025-01-09T11:00:00Z'
  },
  {
    id: 'doc4',
    name: 'GST Returns',
    type: 'business',
    status: 'pending',
    required: true
  },
  {
    id: 'doc5',
    name: 'ITR (Last 3 years)',
    type: 'business',
    status: 'received',
    required: true,
    uploadedAt: '2025-01-09T14:30:00Z'
  },
  {
    id: 'doc6',
    name: 'Business Registration',
    type: 'business',
    status: 'verified',
    required: true,
    uploadedAt: '2025-01-09T09:15:00Z',
    verifiedAt: '2025-01-09T10:00:00Z'
  },
  {
    id: 'doc7',
    name: 'Property Documents',
    type: 'property',
    status: 'pending',
    required: true
  }
];

export const mockWhatsAppMessages: WhatsAppMessage[] = [
  {
    id: 'msg1',
    timestamp: '2025-01-09T09:00:00Z',
    type: 'system',
    content: 'Welcome to Happy Bank! We\'ve received your home loan application. Let\'s get started with document collection.',
    sender: 'system'
  },
  {
    id: 'msg2',
    timestamp: '2025-01-09T09:05:00Z',
    type: 'text',
    content: 'Hello! Thank you for reaching out. We are excited to help you with your home loan.',
    sender: 'customer'
  },
  {
    id: 'msg3',
    timestamp: '2025-01-09T09:10:00Z',
    type: 'system',
    content: 'Please upload your Aadhaar card to proceed with verification.',
    sender: 'system'
  },
  {
    id: 'msg4',
    timestamp: '2025-01-09T10:30:00Z',
    type: 'document',
    content: 'Aadhaar card uploaded successfully',
    sender: 'customer',
    documentId: 'doc1'
  },
  {
    id: 'msg5',
    timestamp: '2025-01-09T10:45:00Z',
    type: 'document',
    content: 'PAN card uploaded successfully',
    sender: 'customer',
    documentId: 'doc2'
  },
  {
    id: 'msg6',
    timestamp: '2025-01-09T11:00:00Z',
    type: 'document',
    content: 'Bank statements uploaded successfully',
    sender: 'customer',
    documentId: 'doc3'
  },
  {
    id: 'msg7',
    timestamp: '2025-01-09T12:00:00Z',
    type: 'system',
    content: 'As you are self-employed, we need additional business documents. Please upload your GST returns and ITR for the last 3 years.',
    sender: 'system'
  },
  {
    id: 'msg8',
    timestamp: '2025-01-09T14:30:00Z',
    type: 'document',
    content: 'ITR documents uploaded successfully',
    sender: 'customer',
    documentId: 'doc5'
  },
  {
    id: 'msg9',
    timestamp: '2025-01-09T15:00:00Z',
    type: 'text',
    content: 'We are still working on getting the GST documents ready. Will upload by tomorrow.',
    sender: 'customer'
  }
];

export const mockComplianceLog: ComplianceLog[] = [
  {
    id: 'log1',
    timestamp: '2025-01-09T09:00:00Z',
    action: 'Case Created',
    user: 'System',
    details: 'New home loan application case created for Ramesh & Sunita Gupta',
    type: 'info'
  },
  {
    id: 'log2',
    timestamp: '2025-01-09T09:05:00Z',
    action: 'Case Assigned',
    user: 'Rajesh Kumar (Manager)',
    details: 'Case assigned to Priya Sharma (Salesperson)',
    type: 'info'
  },
  {
    id: 'log3',
    timestamp: '2025-01-09T10:30:00Z',
    action: 'Document Received',
    user: 'WhatsApp API',
    details: 'Aadhaar card received via WhatsApp and encrypted',
    type: 'success'
  },
  {
    id: 'log4',
    timestamp: '2025-01-09T10:45:00Z',
    action: 'Document Received',
    user: 'WhatsApp API',
    details: 'PAN card received via WhatsApp and encrypted',
    type: 'success'
  },
  {
    id: 'log5',
    timestamp: '2025-01-09T11:15:00Z',
    action: 'Document Verified',
    user: 'Priya Sharma (Salesperson)',
    details: 'Aadhaar card verification completed',
    type: 'success'
  },
  {
    id: 'log6',
    timestamp: '2025-01-09T11:20:00Z',
    action: 'Document Verified',
    user: 'Priya Sharma (Salesperson)',
    details: 'PAN card verification completed',
    type: 'success'
  },
  {
    id: 'log7',
    timestamp: '2025-01-09T12:00:00Z',
    action: 'Additional Documents Requested',
    user: 'System',
    details: 'GST and ITR documents requested due to self-employed status',
    type: 'warning'
  },
  {
    id: 'log8',
    timestamp: '2025-01-09T14:30:00Z',
    action: 'Document Received',
    user: 'WhatsApp API',
    details: 'ITR documents received via WhatsApp and encrypted',
    type: 'success'
  }
];

export const mockCase: Case = {
  id: 'case-001',
  caseNumber: 'HBI-HL-2025-001',
  customer: {
    id: 'cust1',
    name: 'Ramesh & Sunita Gupta',
    phone: '+91-9876543210',
    age: 55,
    maritalStatus: 'married',
    employment: 'self-employed',
    loanType: 'Home Loan',
    loanAmount: 5000000,
    riskProfile: 'medium',
    createdAt: '2025-01-09T09:00:00Z'
  },
  assignedTo: '1',
  status: 'in-progress',
  documents: mockDocuments,
  whatsappMessages: mockWhatsAppMessages,
  complianceLog: mockComplianceLog,
  createdAt: '2025-01-09T09:00:00Z',
  updatedAt: '2025-01-09T15:00:00Z',
  priority: 'high'
};