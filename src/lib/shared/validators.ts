/**
 * Shared validation utilities
 * Centralized validation functions to avoid duplication across the codebase
 */

/**
 * Common validation patterns
 */
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  githubUrl: /^https:\/\/(www\.)?github\.com\/.+/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

/**
 * Basic validation functions
 */
export const validators = {
  /**
   * Check if value is not empty
   */
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    if (!email) return true; // Allow empty for optional fields
    return validationPatterns.email.test(email);
  },

  /**
   * Validate URL format
   */
  url: (url: string): boolean => {
    if (!url) return true; // Allow empty for optional fields
    try {
      new URL(url);
      return validationPatterns.url.test(url);
    } catch {
      return false;
    }
  },

  /**
   * Validate GitHub URL
   */
  githubUrl: (url: string): boolean => {
    if (!url) return true; // Allow empty for optional fields
    return validationPatterns.githubUrl.test(url);
  },

  /**
   * Validate phone number
   */
  phone: (phone: string): boolean => {
    if (!phone) return true; // Allow empty for optional fields
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return validationPatterns.phone.test(cleaned);
  },

  /**
   * Validate hex color
   */
  hexColor: (color: string): boolean => {
    if (!color) return true; // Allow empty for optional fields
    return validationPatterns.hexColor.test(color);
  },

  /**
   * Validate date string
   */
  date: (dateString: string): boolean => {
    if (!dateString) return true; // Allow empty for optional fields
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  /**
   * Validate future date
   */
  futureDate: (dateString: string): boolean => {
    if (!dateString) return true; // Allow empty for optional fields
    const date = new Date(dateString);
    return date > new Date();
  },

  /**
   * Validate string length
   */
  length: (value: string, min: number, max?: number): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const length = value.trim().length;
    if (length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
  },

  /**
   * Validate number range
   */
  numberRange: (value: number, min?: number, max?: number): boolean => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  },

  /**
   * Validate array length
   */
  arrayLength: (array: any[], min?: number, max?: number): boolean => {
    if (min !== undefined && array.length < min) return false;
    if (max !== undefined && array.length > max) return false;
    return true;
  },

  /**
   * Validate file type
   */
  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   */
  fileSize: (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },
};

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validation rule type
 */
export type ValidationRule<T = any> = {
  validator: (value: T) => boolean;
  message: string;
};

/**
 * Create validation rule
 */
export const createValidationRule = <T = any>(
  validator: (value: T) => boolean,
  message: string
): ValidationRule<T> => ({
  validator,
  message,
});

/**
 * Common validation rules
 */
export const validationRules = {
  required: createValidationRule(validators.required, 'This field is required'),
  email: createValidationRule(
    validators.email,
    'Please enter a valid email address'
  ),
  url: createValidationRule(validators.url, 'Please enter a valid URL'),
  githubUrl: createValidationRule(
    validators.githubUrl,
    'Please enter a valid GitHub URL'
  ),
  phone: createValidationRule(
    validators.phone,
    'Please enter a valid phone number'
  ),
  hexColor: createValidationRule(
    validators.hexColor,
    'Please enter a valid hex color'
  ),
  date: createValidationRule(validators.date, 'Please enter a valid date'),
  futureDate: createValidationRule(
    validators.futureDate,
    'Date must be in the future'
  ),

  // Parameterized rules
  minLength: (min: number) =>
    createValidationRule(
      (value: string) => validators.length(value, min),
      `Must be at least ${min} characters long`
    ),
  maxLength: (max: number) =>
    createValidationRule(
      (value: string) => validators.length(value, 0, max),
      `Must be no more than ${max} characters long`
    ),
  lengthRange: (min: number, max: number) =>
    createValidationRule(
      (value: string) => validators.length(value, min, max),
      `Must be between ${min} and ${max} characters long`
    ),
  minValue: (min: number) =>
    createValidationRule(
      (value: number) => validators.numberRange(value, min),
      `Must be at least ${min}`
    ),
  maxValue: (max: number) =>
    createValidationRule(
      (value: number) => validators.numberRange(value, undefined, max),
      `Must be no more than ${max}`
    ),
  valueRange: (min: number, max: number) =>
    createValidationRule(
      (value: number) => validators.numberRange(value, min, max),
      `Must be between ${min} and ${max}`
    ),
};

/**
 * Validate single field with multiple rules
 */
export const validateField = <T = any>(
  value: T,
  rules: ValidationRule<T>[]
): FieldValidationResult => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return {
        isValid: false,
        error: rule.message,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate multiple fields
 */
export const validateFields = (
  fields: Record<string, { value: any; rules: ValidationRule[] }>
): ValidationResult => {
  const errors: string[] = [];

  Object.entries(fields).forEach(([fieldName, { value, rules }]) => {
    const result = validateField(value, rules);
    if (!result.isValid && result.error) {
      errors.push(`${fieldName}: ${result.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Async validation function type
 */
export type AsyncValidator<T = any> = (value: T) => Promise<boolean>;

/**
 * Async validation rule
 */
export interface AsyncValidationRule<T = any> {
  validator: AsyncValidator<T>;
  message: string;
}

/**
 * Validate field asynchronously
 */
export const validateFieldAsync = async <T = any>(
  value: T,
  rules: AsyncValidationRule<T>[]
): Promise<FieldValidationResult> => {
  for (const rule of rules) {
    const isValid = await rule.validator(value);
    if (!isValid) {
      return {
        isValid: false,
        error: rule.message,
      };
    }
  }

  return { isValid: true };
};

/**
 * Debounced validation for real-time form validation
 */
export const createDebouncedValidator = <T = any>(
  validator: (
    value: T
  ) => FieldValidationResult | Promise<FieldValidationResult>,
  delay = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: T): Promise<FieldValidationResult> => {
    return new Promise(resolve => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validator(value);
        resolve(result);
      }, delay);
    });
  };
};

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  isValidating: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Create initial form validation state
 */
export const createInitialValidationState = (
  fields: string[]
): FormValidationState => ({
  isValid: false,
  isValidating: false,
  errors: fields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}),
  touched: fields.reduce((acc, field) => ({ ...acc, [field]: false }), {}),
});

/**
 * Update form validation state
 */
export const updateValidationState = (
  state: FormValidationState,
  field: string,
  result: FieldValidationResult,
  touched = true
): FormValidationState => ({
  ...state,
  errors: {
    ...state.errors,
    [field]: result.error || '',
  },
  touched: {
    ...state.touched,
    [field]: touched,
  },
  isValid: Object.values({
    ...state.errors,
    [field]: result.error || '',
  }).every(error => !error),
});

export default validators;
