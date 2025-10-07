import { useState, useCallback, useMemo } from 'react';
import { 
  validateField, 
  validateForm, 
  ValidationRule, 
  FieldValidation,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizePAN,
  sanitizeAadhaar,
  sanitizeAmount
} from '../utils/validation';

// =============================================================================
// FORM VALIDATION HOOK
// =============================================================================

export interface UseFormValidationOptions {
  validationRules: FieldValidation;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitizeOnChange?: boolean;
  initialValues?: Record<string, string>;
}

export interface FormValidationState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormValidationActions {
  setValue: (field: string, value: string) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  validateField: (field: string) => boolean;
  validateAllFields: () => boolean;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: string) => () => void;
  handleSubmit: (onSubmit: (values: Record<string, string>) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;
  reset: (newInitialValues?: Record<string, string>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

export function useFormValidation({
  validationRules,
  validateOnChange = true,
  validateOnBlur = true,
  sanitizeOnChange = true,
  initialValues = {}
}: UseFormValidationOptions): FormValidationState & FormValidationActions {
  
  // Initialize state
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized validation rules to prevent re-renders
  const memoizedValidationRules = useMemo(() => validationRules, [validationRules]);

  // Memoized isValid calculation - only recalculate when values or errors change
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           Object.keys(memoizedValidationRules).every(field => {
             const value = values[field] || '';
             const rules = memoizedValidationRules[field];
             return validateField(value, rules).isValid;
           });
  }, [values, errors, memoizedValidationRules]);

  // Sanitize input based on field type
  const sanitizeValue = useCallback((field: string, value: string): string => {
    if (!sanitizeOnChange) return value;

    // Check validation rules for specific sanitization
    const rules = memoizedValidationRules[field];
    
    if (rules?.email) {
      return sanitizeEmail(value);
    }
    
    if (rules?.phone) {
      return sanitizePhone(value);
    }

    // Check field name patterns for specific sanitization
    if (field.toLowerCase().includes('pan')) {
      return sanitizePAN(value);
    }

    if (field.toLowerCase().includes('aadhaar')) {
      return sanitizeAadhaar(value);
    }

    if (field.toLowerCase().includes('amount') || field.toLowerCase().includes('salary')) {
      return sanitizeAmount(value);
    }

    return sanitizeInput(value);
  }, [memoizedValidationRules, sanitizeOnChange]);

  // Set field value
  const setValue = useCallback((field: string, value: string) => {
    const sanitizedValue = sanitizeValue(field, value);
    setValues(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [sanitizeValue, errors]);

  // Set field error
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Clear field error
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Validate single field
  const validateSingleField = useCallback((field: string): boolean => {
    const value = values[field] || '';
    const rules = memoizedValidationRules[field];
    
    if (!rules) return true;

    const result = validateField(value, rules);
    
    if (!result.isValid && result.error) {
      setError(field, result.error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [values, memoizedValidationRules, setError, clearError]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const result = validateForm(values, memoizedValidationRules);
    
    if (!result.isValid) {
      setErrors(result.errors);
      return false;
    } else {
      clearAllErrors();
      return true;
    }
  }, [values, memoizedValidationRules, clearAllErrors]);

  // Handle input change
  const handleChange = useCallback((field: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setValue(field, value);
      
      // Validate on change if enabled
      if (validateOnChange && touched[field]) {
        setTimeout(() => validateSingleField(field), 0);
      }
    };
  }, [setValue, validateOnChange, touched, validateSingleField]);

  // Handle input blur
  const handleBlur = useCallback((field: string) => {
    return () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      
      // Validate on blur if enabled
      if (validateOnBlur) {
        validateSingleField(field);
      }
    };
  }, [validateOnBlur, validateSingleField]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: Record<string, string>) => Promise<void> | void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mark all fields as touched
      const allFieldsTouched = Object.keys(memoizedValidationRules).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allFieldsTouched);

      // Validate all fields
      if (!validateAllFields()) {
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, memoizedValidationRules, validateAllFields]);

  // Reset form
  const reset = useCallback((newInitialValues?: Record<string, string>) => {
    const resetValues = newInitialValues || initialValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    // State
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    
    // Actions
    setValue,
    setError,
    clearError,
    clearAllErrors,
    validateField: validateSingleField,
    validateAllFields,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setSubmitting: setIsSubmitting
  };
}

// =============================================================================
// FIELD VALIDATION HOOK (for individual fields)
// =============================================================================

export interface UseFieldValidationOptions {
  rules: ValidationRule;
  initialValue?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitizeOnChange?: boolean;
}

export interface FieldValidationState {
  value: string;
  error: string | null;
  touched: boolean;
  isValid: boolean;
}

export interface FieldValidationActions {
  setValue: (value: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
  validate: () => boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: () => void;
  reset: (newInitialValue?: string) => void;
}

export function useFieldValidation({
  rules,
  initialValue = '',
  validateOnChange = true,
  validateOnBlur = true,
  sanitizeOnChange = true
}: UseFieldValidationOptions): FieldValidationState & FieldValidationActions {
  
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(() => {
    return !error && validateField(value, rules).isValid;
  }, [value, error, rules]);

  // Sanitize value based on rules
  const sanitizeValue = useCallback((inputValue: string): string => {
    if (!sanitizeOnChange) return inputValue;

    if (rules.email) {
      return sanitizeEmail(inputValue);
    }
    
    if (rules.phone) {
      return sanitizePhone(inputValue);
    }

    return sanitizeInput(inputValue);
  }, [rules, sanitizeOnChange]);

  // Set value with sanitization
  const setValueWithSanitization = useCallback((newValue: string) => {
    const sanitizedValue = sanitizeValue(newValue);
    setValue(sanitizedValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [sanitizeValue, error]);

  // Validate field
  const validate = useCallback((): boolean => {
    const result = validateField(value, rules);
    
    if (!result.isValid && result.error) {
      setError(result.error);
      return false;
    } else {
      setError(null);
      return true;
    }
  }, [value, rules]);

  // Handle change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValueWithSanitization(newValue);
    
    // Validate on change if enabled and field has been touched
    if (validateOnChange && touched) {
      setTimeout(() => validate(), 0);
    }
  }, [setValueWithSanitization, validateOnChange, touched, validate]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validate();
    }
  }, [validateOnBlur, validate]);

  // Reset field
  const reset = useCallback((newInitialValue?: string) => {
    const resetValue = newInitialValue || initialValue;
    setValue(resetValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    // State
    value,
    error,
    touched,
    isValid,
    
    // Actions
    setValue: setValueWithSanitization,
    setError,
    clearError: () => setError(null),
    validate,
    handleChange,
    handleBlur,
    reset
  };
}

// =============================================================================
// PASSWORD VALIDATION HOOK (for password fields with confirmation)
// =============================================================================

export interface UsePasswordValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface PasswordValidationState {
  password: string;
  confirmPassword: string;
  passwordError: string | null;
  confirmPasswordError: string | null;
  passwordTouched: boolean;
  confirmPasswordTouched: boolean;
  isValid: boolean;
}

export interface PasswordValidationActions {
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordBlur: () => void;
  handleConfirmPasswordBlur: () => void;
  validatePasswords: () => boolean;
  reset: () => void;
}

export function usePasswordValidation({
  validateOnChange = true,
  validateOnBlur = true
}: UsePasswordValidationOptions = {}): PasswordValidationState & PasswordValidationActions {
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const isValid = useMemo(() => {
    return !passwordError && !confirmPasswordError && password && confirmPassword && password === confirmPassword;
  }, [password, confirmPassword, passwordError, confirmPasswordError]);

  // Validate password
  const validatePassword = useCallback(() => {
    const result = validateField(password, {
      required: true,
      minLength: 8,
      customValidator: (value: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value);
      },
      message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
    });

    if (!result.isValid && result.error) {
      setPasswordError(result.error);
      return false;
    } else {
      setPasswordError(null);
      return true;
    }
  }, [password]);

  // Validate confirm password
  const validateConfirmPassword = useCallback(() => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    setConfirmPasswordError(null);
    return true;
  }, [password, confirmPassword]);

  // Validate both passwords
  const validatePasswords = useCallback(() => {
    const passwordValid = validatePassword();
    const confirmPasswordValid = validateConfirmPassword();
    return passwordValid && confirmPasswordValid;
  }, [validatePassword, validateConfirmPassword]);

  // Handle password change
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
    if (confirmPasswordError && confirmPassword) {
      setConfirmPasswordError(null);
    }

    // Validate on change if enabled and touched
    if (validateOnChange && passwordTouched) {
      setTimeout(() => validatePassword(), 0);
    }
    
    // Re-validate confirm password if it exists
    if (validateOnChange && confirmPassword && confirmPasswordTouched) {
      setTimeout(() => validateConfirmPassword(), 0);
    }
  }, [passwordError, confirmPasswordError, confirmPassword, validateOnChange, passwordTouched, confirmPasswordTouched, validatePassword, validateConfirmPassword]);

  // Handle confirm password change
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    // Clear error when user starts typing
    if (confirmPasswordError) {
      setConfirmPasswordError(null);
    }

    // Validate on change if enabled and touched
    if (validateOnChange && confirmPasswordTouched) {
      setTimeout(() => validateConfirmPassword(), 0);
    }
  }, [confirmPasswordError, validateOnChange, confirmPasswordTouched, validateConfirmPassword]);

  // Handle password blur
  const handlePasswordBlur = useCallback(() => {
    setPasswordTouched(true);
    
    if (validateOnBlur) {
      validatePassword();
    }
  }, [validateOnBlur, validatePassword]);

  // Handle confirm password blur
  const handleConfirmPasswordBlur = useCallback(() => {
    setConfirmPasswordTouched(true);
    
    if (validateOnBlur) {
      validateConfirmPassword();
    }
  }, [validateOnBlur, validateConfirmPassword]);

  // Reset
  const reset = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setConfirmPasswordError(null);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
  }, []);

  return {
    // State
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    passwordTouched,
    confirmPasswordTouched,
    isValid,
    
    // Actions
    setPassword,
    setConfirmPassword,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePasswordBlur,
    handleConfirmPasswordBlur,
    validatePasswords,
    reset
  };
}
