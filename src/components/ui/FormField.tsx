import React, { useState, useEffect, memo, useCallback } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Phone } from 'lucide-react';

// =============================================================================
// FORM FIELD WRAPPER
// =============================================================================

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  success?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ 
  label, 
  error, 
  required, 
  helpText, 
  success,
  className = '',
  children 
}: FormFieldProps) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success && !hasError);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
        
        {/* Success Icon */}
        {hasSuccess && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        {/* Error Icon */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
      
      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

// =============================================================================
// VALIDATED INPUT
// =============================================================================

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
}

export const ValidatedInput = memo(function ValidatedInput({
  label,
  error,
  success,
  required,
  helpText,
  icon,
  value,
  onChange,
  onBlur,
  containerClassName = '',
  className = '',
  ...props
}: ValidatedInputProps) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success && !hasError);
  const hasIcon = Boolean(icon);

  const inputClasses = `
    w-full px-3 py-2 border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    ${hasIcon ? 'pl-10' : ''}
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : hasSuccess 
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${className}
  `;

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      success={hasSuccess}
      className={containerClassName}
    >
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
          {...props}
        />
      </div>
    </FormField>
  );
});

// =============================================================================
// VALIDATED TEXTAREA
// =============================================================================

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onBlur'> {
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
}

export function ValidatedTextarea({
  label,
  error,
  success,
  required,
  helpText,
  value,
  onChange,
  onBlur,
  containerClassName = '',
  className = '',
  showCharacterCount = false,
  maxLength,
  ...props
}: ValidatedTextareaProps) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success && !hasError);
  const characterCount = value?.length || 0;

  const textareaClasses = `
    w-full px-3 py-2 border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : hasSuccess 
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${className}
  `;

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={!showCharacterCount ? helpText : undefined}
      success={hasSuccess}
      className={containerClassName}
    >
      <textarea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={textareaClasses}
        maxLength={maxLength}
        {...props}
      />
      
      {/* Character Count or Help Text */}
      {(showCharacterCount || helpText) && !hasError && (
        <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
          {helpText && <span>{helpText}</span>}
          {showCharacterCount && (
            <span className={characterCount === maxLength ? 'text-yellow-600' : ''}>
              {characterCount}{maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
      )}
    </FormField>
  );
}

// =============================================================================
// VALIDATED SELECT
// =============================================================================

interface ValidatedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'onBlur'> {
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const ValidatedSelect = memo(function ValidatedSelect({
  label,
  error,
  success,
  required,
  helpText,
  value,
  onChange,
  onBlur,
  containerClassName = '',
  className = '',
  options,
  placeholder = 'Select an option',
  ...props
}: ValidatedSelectProps) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success && !hasError);

  const selectClasses = `
    w-full px-3 py-2 border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : hasSuccess 
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${className}
  `;

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      success={hasSuccess}
      className={containerClassName}
    >
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={selectClasses}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});

// =============================================================================
// PASSWORD INPUT WITH VISIBILITY TOGGLE
// =============================================================================

interface ValidatedPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'type'> {
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  showToggle?: boolean;
}

export function ValidatedPasswordInput({
  label,
  error,
  success,
  required,
  helpText,
  value,
  onChange,
  onBlur,
  containerClassName = '',
  className = '',
  showToggle = true,
  ...props
}: ValidatedPasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success && !hasError);

  const inputClasses = `
    w-full pl-3 pr-10 py-2 border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : hasSuccess 
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${className}
  `;

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      success={hasSuccess}
      className={containerClassName}
    >
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
          {...props}
        />
        
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </FormField>
  );
}

// =============================================================================
// FORM SECTION
// =============================================================================

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className = '' 
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-2">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// FORM ACTIONS
// =============================================================================

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function FormActions({ 
  children, 
  className = '', 
  align = 'right' 
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex items-center gap-3 pt-4 border-t border-gray-200 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

// =============================================================================
// VALIDATION SUMMARY
// =============================================================================

interface ValidationSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function ValidationSummary({ errors, className = '' }: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center mb-2">
        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
        <h4 className="text-sm font-medium text-red-800">
          Please correct the following errors:
        </h4>
      </div>
      <ul className="text-sm text-red-700 space-y-1 ml-6">
        {errorEntries.map(([field, error]) => (
          <li key={field} className="list-disc">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// INDIAN MOBILE INPUT COMPONENT
// =============================================================================

interface IndianMobileInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const IndianMobileInput = memo(function IndianMobileInput({
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "Enter 10-digit mobile number",
  className = "",
  disabled = false
}: IndianMobileInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove any non-digit characters
    inputValue = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (inputValue.length > 10) {
      inputValue = inputValue.substring(0, 10);
    }
    
    setDisplayValue(inputValue);
    onChange(inputValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const hasError = Boolean(error);
  const hasValue = Boolean(displayValue);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* +91 Prefix */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-600 font-medium text-sm">+91</span>
        </div>
        
        {/* Input Field */}
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-16 pr-10 py-2.5 border rounded-lg text-sm
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
              : hasValue && !hasError
                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${isFocused ? 'shadow-sm' : ''}
          `}
          maxLength={10}
        />
        
        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : hasValue && !hasError ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : null}
        </div>
      </div>
      
      {/* Error Message */}
      {hasError && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
      
      {/* Help Text */}
      {!hasError && (
        <p className="mt-1 text-xs text-gray-500">
          Enter 10-digit mobile number starting with 6-9
        </p>
      )}
    </div>
  );
});
