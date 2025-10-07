// =============================================================================
// VALIDATION UTILITIES
// Banking Application - Comprehensive Input Validation
// =============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  numeric?: boolean;
  alphanumeric?: boolean;
  noSpecialChars?: boolean;
  customValidator?: (value: string) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

// =============================================================================
// CORE VALIDATION FUNCTIONS
// =============================================================================

export function validateField(value: string, rules: ValidationRule): ValidationResult {
  const trimmedValue = value?.trim() || '';

  // Required field validation
  if (rules.required && !trimmedValue) {
    return {
      isValid: false,
      error: rules.message || 'This field is required'
    };
  }

  // Skip other validations if field is empty and not required
  if (!trimmedValue && !rules.required) {
    return { isValid: true };
  }

  // Minimum length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      isValid: false,
      error: rules.message || `Minimum ${rules.minLength} characters required`
    };
  }

  // Maximum length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: rules.message || `Maximum ${rules.maxLength} characters allowed`
    };
  }

  // Email validation
  if (rules.email && !isValidEmail(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Please enter a valid email address'
    };
  }

  // Phone validation
  if (rules.phone && !isValidPhone(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Please enter a valid phone number'
    };
  }

  // Numeric validation
  if (rules.numeric && !isNumeric(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Only numbers are allowed'
    };
  }

  // Alphanumeric validation
  if (rules.alphanumeric && !isAlphanumeric(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Only letters and numbers are allowed'
    };
  }

  // No special characters validation
  if (rules.noSpecialChars && hasSpecialChars(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Special characters are not allowed'
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Invalid format'
    };
  }

  // Custom validator
  if (rules.customValidator && !rules.customValidator(trimmedValue)) {
    return {
      isValid: false,
      error: rules.message || 'Invalid value'
    };
  }

  return { isValid: true };
}

export function validateForm(formData: Record<string, string>, validationRules: FieldValidation): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName] || '';
    const rules = validationRules[fieldName];
    const result = validateField(value, rules);

    if (!result.isValid) {
      errors[fieldName] = result.error || 'Invalid value';
      isValid = false;
    }
  });

  return { isValid, errors };
}

// =============================================================================
// BANKING-SPECIFIC VALIDATION FUNCTIONS
// =============================================================================

export function isValidPAN(pan: string): boolean {
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panPattern.test(pan.toUpperCase());
}

export function isValidAadhaar(aadhaar: string): boolean {
  const aadhaarPattern = /^[0-9]{12}$/;
  return aadhaarPattern.test(aadhaar.replace(/\s/g, ''));
}

export function isValidAccountNumber(accountNumber: string): boolean {
  const accountPattern = /^[0-9]{9,18}$/;
  return accountPattern.test(accountNumber);
}

export function isValidIFSC(ifsc: string): boolean {
  const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscPattern.test(ifsc.toUpperCase());
}

export function isValidAmount(amount: string): boolean {
  const amountPattern = /^\d+(\.\d{1,2})?$/;
  const numericAmount = parseFloat(amount);
  return amountPattern.test(amount) && numericAmount > 0 && numericAmount <= 10000000; // Max 1 crore
}

export function isValidLoanTenure(tenure: string): boolean {
  const numericTenure = parseInt(tenure);
  return !isNaN(numericTenure) && numericTenure >= 1 && numericTenure <= 360; // 1-360 months
}

export function isValidCreditScore(score: string): boolean {
  const numericScore = parseInt(score);
  return !isNaN(numericScore) && numericScore >= 300 && numericScore <= 900;
}

// =============================================================================
// GENERAL VALIDATION HELPER FUNCTIONS
// =============================================================================

export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Indian phone number patterns - accepts +91, 91, 0, or direct 10-digit
  const phonePattern = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return phonePattern.test(phone.replace(/[\s-]/g, ''));
}

export function isValidIndianMobile(mobile: string): boolean {
  // Strict Indian mobile validation - 10 digits starting with 6-9
  const mobilePattern = /^[6-9]\d{9}$/;
  return mobilePattern.test(mobile.replace(/[\s-]/g, ''));
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function hasSpecialChars(value: string): boolean {
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(value);
}

export function isValidPassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    };
  }

  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character (!@#$%^&*)'
    };
  }

  return { isValid: true };
}

export function isValidName(name: string): boolean {
  // Allow letters, spaces, dots, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s.''-]+$/;
  return namePattern.test(name) && name.length >= 2 && name.length <= 50;
}

export function isValidPincode(pincode: string): boolean {
  const pincodePattern = /^[0-9]{6}$/;
  return pincodePattern.test(pincode);
}

export function isValidGST(gst: string): boolean {
  const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstPattern.test(gst.toUpperCase());
}

// =============================================================================
// PREDEFINED VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  // Personal Information
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s.'-]+$/,
    customValidator: isValidName,
    message: 'Please enter a valid first name (2-50 characters, letters only)'
  },

  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s.'-]+$/,
    customValidator: isValidName,
    message: 'Please enter a valid last name (2-50 characters, letters only)'
  },

  fullName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    customValidator: isValidName,
    message: 'Please enter a valid full name (3-100 characters, letters only)'
  },

  email: {
    required: true,
    email: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 100,
    message: 'Please enter a valid email address'
  },

  phone: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    customValidator: isValidIndianMobile,
    message: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)'
  },

  password: {
    required: true,
    minLength: 8,
    maxLength: 50,
    customValidator: (value: string) => isValidPassword(value).isValid,
    message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
  },

  // Banking Information
  panNumber: {
    required: true,
    minLength: 10,
    maxLength: 10,
    customValidator: isValidPAN,
    message: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
  },

  aadhaarNumber: {
    required: true,
    minLength: 12,
    maxLength: 12,
    customValidator: isValidAadhaar,
    message: 'Please enter a valid 12-digit Aadhaar number'
  },

  accountNumber: {
    required: true,
    minLength: 9,
    maxLength: 18,
    customValidator: isValidAccountNumber,
    message: 'Please enter a valid bank account number (9-18 digits)'
  },

  ifscCode: {
    required: true,
    minLength: 11,
    maxLength: 11,
    customValidator: isValidIFSC,
    message: 'Please enter a valid IFSC code (e.g., SBIN0001234)'
  },

  loanAmount: {
    required: true,
    customValidator: isValidAmount,
    message: 'Please enter a valid amount (up to ₹1 crore)'
  },

  loanTenure: {
    required: true,
    customValidator: isValidLoanTenure,
    message: 'Please enter a valid tenure (1-360 months)'
  },

  creditScore: {
    required: false,
    customValidator: isValidCreditScore,
    message: 'Please enter a valid credit score (300-900)'
  },

  // Address Information
  pincode: {
    required: true,
    minLength: 6,
    maxLength: 6,
    customValidator: isValidPincode,
    message: 'Please enter a valid 6-digit pincode'
  },

  address: {
    required: true,
    minLength: 10,
    maxLength: 200,
    message: 'Please enter a complete address (10-200 characters)'
  },

  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
    customValidator: isValidName,
    message: 'Please enter a valid city name'
  },

  state: {
    required: true,
    minLength: 2,
    maxLength: 50,
    customValidator: isValidName,
    message: 'Please enter a valid state name'
  },

  // Business Information
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Please enter a valid company name (2-100 characters)'
  },

  gstNumber: {
    required: false,
    minLength: 15,
    maxLength: 15,
    customValidator: isValidGST,
    message: 'Please enter a valid GST number'
  },

  // System Fields
  employeeId: {
    required: true,
    minLength: 3,
    maxLength: 20,
    alphanumeric: true,
    message: 'Please enter a valid employee ID (3-20 alphanumeric characters)'
  },

  caseNumber: {
    required: true,
    minLength: 5,
    maxLength: 20,
    alphanumeric: true,
    message: 'Please enter a valid case number'
  },

  // General Fields
  description: {
    required: false,
    maxLength: 1000,
    message: 'Description cannot exceed 1000 characters'
  },

  notes: {
    required: false,
    maxLength: 500,
    message: 'Notes cannot exceed 500 characters'
  },

  comments: {
    required: false,
    maxLength: 500,
    message: 'Comments cannot exceed 500 characters'
  }
};

// =============================================================================
// SANITIZATION FUNCTIONS
// =============================================================================

export function sanitizeInput(value: string): string {
  return value?.trim().replace(/\s+/g, ' ') || '';
}

export function sanitizeEmail(email: string): string {
  return email?.trim().toLowerCase() || '';
}

export function sanitizePhone(phone: string): string {
  return phone?.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^91/, '').replace(/^0/, '') || '';
}

export function sanitizePAN(pan: string): string {
  return pan?.toUpperCase().replace(/\s/g, '') || '';
}

export function sanitizeAadhaar(aadhaar: string): string {
  return aadhaar?.replace(/\s/g, '') || '';
}

export function sanitizeAmount(amount: string): string {
  return amount?.replace(/[^\d.]/g, '') || '';
}

// =============================================================================
// VALIDATION ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit mobile number',
  INVALID_PAN: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
  INVALID_AADHAAR: 'Please enter a valid 12-digit Aadhaar number',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
  NUMERIC_ONLY: 'Only numbers are allowed',
  ALPHANUMERIC_ONLY: 'Only letters and numbers are allowed',
  NO_SPECIAL_CHARS: 'Special characters are not allowed'
};
