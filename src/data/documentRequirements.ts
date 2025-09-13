export interface DocumentRequirement {
  id: string;
  name: string;
  type: string;
  category: 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other';
  required: boolean;
  priority: 'high' | 'medium' | 'low';
  description: string;
  acceptedFormats: string[];
  maxSize: number; // in MB
  validityPeriod?: number; // in days
}

export interface ProductDocumentConfig {
  productType: string;
  documents: DocumentRequirement[];
  additionalRequirements?: {
    condition: string;
    documents: DocumentRequirement[];
  }[];
}

export const documentRequirements: ProductDocumentConfig[] = [
  {
    productType: 'Home Loan',
    documents: [
      {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Government issued identity proof',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'pan',
        name: 'PAN Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Permanent Account Number card',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'bank_statements',
        name: 'Bank Statements (6 months)',
        type: 'financial',
        category: 'financial',
        required: true,
        priority: 'high',
        description: 'Last 6 months bank statements',
        acceptedFormats: ['PDF'],
        maxSize: 10,
        validityPeriod: 30
      },
      {
        id: 'salary_slips',
        name: 'Salary Slips (3 months)',
        type: 'employment',
        category: 'employment',
        required: true,
        priority: 'high',
        description: 'Last 3 months salary slips',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5,
        validityPeriod: 30
      },
      {
        id: 'property_documents',
        name: 'Property Documents',
        type: 'property',
        category: 'property',
        required: true,
        priority: 'high',
        description: 'Sale deed, NOC, approved plan',
        acceptedFormats: ['PDF'],
        maxSize: 20
      },
      {
        id: 'employment_certificate',
        name: 'Employment Certificate',
        type: 'employment',
        category: 'employment',
        required: true,
        priority: 'medium',
        description: 'Letter from employer',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      }
    ],
    additionalRequirements: [
      {
        condition: 'self-employed',
        documents: [
          {
            id: 'gst_returns',
            name: 'GST Returns (12 months)',
            type: 'business',
            category: 'business',
            required: true,
            priority: 'high',
            description: 'Last 12 months GST returns',
            acceptedFormats: ['PDF'],
            maxSize: 10,
            validityPeriod: 30
          },
          {
            id: 'itr',
            name: 'ITR (3 years)',
            type: 'business',
            category: 'business',
            required: true,
            priority: 'high',
            description: 'Last 3 years Income Tax Returns',
            acceptedFormats: ['PDF'],
            maxSize: 15,
            validityPeriod: 365
          },
          {
            id: 'business_registration',
            name: 'Business Registration',
            type: 'business',
            category: 'business',
            required: true,
            priority: 'medium',
            description: 'Business registration certificate',
            acceptedFormats: ['PDF', 'JPG', 'PNG'],
            maxSize: 5
          }
        ]
      }
    ]
  },
  {
    productType: 'Personal Loan',
    documents: [
      {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Government issued identity proof',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'pan',
        name: 'PAN Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Permanent Account Number card',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'bank_statements',
        name: 'Bank Statements (3 months)',
        type: 'financial',
        category: 'financial',
        required: true,
        priority: 'high',
        description: 'Last 3 months bank statements',
        acceptedFormats: ['PDF'],
        maxSize: 10,
        validityPeriod: 30
      },
      {
        id: 'salary_slips',
        name: 'Salary Slips (2 months)',
        type: 'employment',
        category: 'employment',
        required: true,
        priority: 'high',
        description: 'Last 2 months salary slips',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5,
        validityPeriod: 30
      }
    ]
  },
  {
    productType: 'Business Loan',
    documents: [
      {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Government issued identity proof',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'pan',
        name: 'PAN Card',
        type: 'identity',
        category: 'identity',
        required: true,
        priority: 'high',
        description: 'Permanent Account Number card',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'business_pan',
        name: 'Business PAN Card',
        type: 'business',
        category: 'business',
        required: true,
        priority: 'high',
        description: 'Business PAN card',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'gst_certificate',
        name: 'GST Registration Certificate',
        type: 'business',
        category: 'business',
        required: true,
        priority: 'high',
        description: 'GST registration certificate',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSize: 5
      },
      {
        id: 'bank_statements',
        name: 'Business Bank Statements (12 months)',
        type: 'financial',
        category: 'financial',
        required: true,
        priority: 'high',
        description: 'Last 12 months business bank statements',
        acceptedFormats: ['PDF'],
        maxSize: 20,
        validityPeriod: 30
      },
      {
        id: 'financial_statements',
        name: 'Financial Statements (2 years)',
        type: 'financial',
        category: 'financial',
        required: true,
        priority: 'high',
        description: 'Audited financial statements for last 2 years',
        acceptedFormats: ['PDF'],
        maxSize: 15
      }
    ]
  }
];

export const getDocumentRequirements = (productType: string, customerProfile?: any): DocumentRequirement[] => {
  const config = documentRequirements.find(req => req.productType === productType);
  if (!config) return [];

  let allDocuments = [...config.documents];

  // Add additional requirements based on customer profile
  if (config.additionalRequirements && customerProfile) {
    config.additionalRequirements.forEach(additional => {
      if (customerProfile.employment === 'self-employed' && additional.condition === 'self-employed') {
        allDocuments = [...allDocuments, ...additional.documents];
      }
    });
  }

  return allDocuments;
};