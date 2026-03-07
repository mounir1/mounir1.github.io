/**
 * Schema validation utilities and functions
 */

import { z } from 'zod';
import {
  ProjectSchema,
  ProjectUpdateSchema,
  ProjectCreateSchema,
} from './projectSchema';
import {
  SkillSchema,
  SkillUpdateSchema,
  SkillCreateSchema,
} from './skillSchema';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationContext,
  BulkValidationResult,
  ValidationMetrics,
} from './types';

/**
 * Enhanced validation function with detailed error reporting
 */
export function validateWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: ValidationContext = {}
): ValidationResult<T> {
  const startTime = performance.now();

  try {
    const validatedData = schema.parse(data);
    const endTime = performance.now();

    return {
      success: true,
      data: validatedData,
      errors: [],
      warnings: generateWarnings(validatedData, context),
    };
  } catch (error) {
    const endTime = performance.now();

    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.path.reduce((obj: any, key) => obj?.[key], data),
      }));

      return {
        success: false,
        errors,
        warnings: [],
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'root',
          message: 'Unknown validation error',
          code: 'unknown',
          value: data,
        },
      ],
      warnings: [],
    };
  }
}

/**
 * Generate warnings for valid data that might need attention
 */
function generateWarnings<T>(
  data: T,
  context: ValidationContext
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Add context-specific warnings here
  if (context.strict) {
    // Add strict mode warnings
  }

  return warnings;
}

/**
 * Project validation functions
 */
export const validateProject = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(ProjectSchema, data, context);
};

export const validateProjectUpdate = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(ProjectUpdateSchema, data, context);
};

export const validateProjectCreate = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(ProjectCreateSchema, data, context);
};

/**
 * Skill validation functions
 */
export const validateSkill = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(SkillSchema, data, context);
};

export const validateSkillUpdate = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(SkillUpdateSchema, data, context);
};

export const validateSkillCreate = (
  data: unknown,
  context?: ValidationContext
): ValidationResult<any> => {
  return validateWithDetails(SkillCreateSchema, data, context);
};

/**
 * Bulk validation for multiple items
 */
export function validateBulk<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  context: ValidationContext = {}
): BulkValidationResult<T> {
  const startTime = performance.now();
  const valid: T[] = [];
  const invalid: Array<{
    index: number;
    data: unknown;
    errors: ValidationError[];
  }> = [];

  items.forEach((item, index) => {
    const result = validateWithDetails(schema, item, context);

    if (result.success && result.data) {
      valid.push(result.data);
    } else {
      invalid.push({
        index,
        data: item,
        errors: result.errors || [],
      });
    }
  });

  const endTime = performance.now();

  return {
    valid,
    invalid,
    summary: {
      total: items.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      processingTime: endTime - startTime,
    },
  };
}

/**
 * Bulk project validation
 */
export const validateProjectsBulk = (
  projects: unknown[],
  context?: ValidationContext
): BulkValidationResult<any> => {
  return validateBulk(ProjectSchema, projects, context);
};

/**
 * Bulk skill validation
 */
export const validateSkillsBulk = (
  skills: unknown[],
  context?: ValidationContext
): BulkValidationResult<any> => {
  return validateBulk(SkillSchema, skills, context);
};

/**
 * Field-level validation for real-time form validation
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldPath: string,
  value: unknown
): ValidationResult<unknown> {
  try {
    // Extract the field schema from the main schema
    const fieldSchema = getFieldSchema(schema, fieldPath);

    if (!fieldSchema) {
      return {
        success: false,
        errors: [
          {
            field: fieldPath,
            message: 'Field not found in schema',
            code: 'field_not_found',
            value,
          },
        ],
      };
    }

    const validatedValue = fieldSchema.parse(value);

    return {
      success: true,
      data: validatedValue,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: fieldPath,
          message: err.message,
          code: err.code,
          value,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: fieldPath,
          message: 'Unknown validation error',
          code: 'unknown',
          value,
        },
      ],
    };
  }
}

/**
 * Extract field schema from a complex schema
 */
function getFieldSchema(
  schema: z.ZodSchema<any>,
  fieldPath: string
): z.ZodSchema<any> | null {
  const pathParts = fieldPath.split('.');
  let currentSchema = schema;

  for (const part of pathParts) {
    if (currentSchema instanceof z.ZodObject) {
      const shape = currentSchema.shape;
      if (shape && shape[part]) {
        currentSchema = shape[part];
      } else {
        return null;
      }
    } else if (currentSchema instanceof z.ZodEffects) {
      // Handle ZodEffects (refined schemas)
      currentSchema = currentSchema._def.schema;
      // Retry with the inner schema
      return getFieldSchema(currentSchema, fieldPath);
    } else {
      return null;
    }
  }

  return currentSchema;
}

/**
 * Project field validation
 */
export const validateProjectField = (
  fieldPath: string,
  value: unknown
): ValidationResult<unknown> => {
  return validateField(ProjectSchema, fieldPath, value);
};

/**
 * Skill field validation
 */
export const validateSkillField = (
  fieldPath: string,
  value: unknown
): ValidationResult<unknown> => {
  return validateField(SkillSchema, fieldPath, value);
};

/**
 * Safe parsing with fallback values
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): T {
  try {
    return schema.parse(data);
  } catch {
    return fallback;
  }
}

/**
 * Validation metrics collection
 */
export function collectValidationMetrics<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationMetrics {
  const startTime = performance.now();
  const startMemory = performance.memory?.usedJSHeapSize || 0;

  let errorCount = 0;
  const warningCount = 0;
  let fieldCount = 0;

  try {
    schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorCount = error.errors.length;
    }
  }

  // Count fields (simplified)
  if (typeof data === 'object' && data !== null) {
    fieldCount = Object.keys(data).length;
  }

  const endTime = performance.now();
  const endMemory = performance.memory?.usedJSHeapSize || 0;

  return {
    validationTime: endTime - startTime,
    fieldCount,
    errorCount,
    warningCount,
    memoryUsage: endMemory - startMemory,
  };
}

/**
 * Schema compatibility checking
 */
export function checkSchemaCompatibility<T>(
  oldSchema: z.ZodSchema<T>,
  newSchema: z.ZodSchema<T>,
  testData: unknown[]
): {
  compatible: boolean;
  issues: string[];
  successRate: number;
} {
  let successCount = 0;
  const issues: string[] = [];

  testData.forEach((data, index) => {
    try {
      const oldResult = oldSchema.safeParse(data);
      const newResult = newSchema.safeParse(data);

      if (oldResult.success && !newResult.success) {
        issues.push(
          `Data item ${index}: Valid in old schema but invalid in new schema`
        );
      } else if (oldResult.success && newResult.success) {
        successCount++;
      }
    } catch (error) {
      issues.push(`Data item ${index}: Error during compatibility check`);
    }
  });

  return {
    compatible: issues.length === 0,
    issues,
    successRate: testData.length > 0 ? successCount / testData.length : 0,
  };
}

/**
 * Validation error formatting utilities
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join('; ');
}

export function groupValidationErrorsByField(
  errors: ValidationError[]
): Record<string, ValidationError[]> {
  return errors.reduce(
    (acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = [];
      }
      acc[error.field].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>
  );
}

/**
 * Validation result utilities
 */
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is ValidationResult<T> & { success: true; data: T } {
  return result.success && result.data !== undefined;
}

export function getValidationErrorMessage(
  result: ValidationResult<any>
): string {
  if (result.success) return '';
  return formatValidationErrors(result.errors || []);
}
