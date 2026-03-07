/**
 * React hooks for schema validation in forms and data operations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { z } from 'zod';
import {
  validateProject,
  validateProjectUpdate,
  validateProjectCreate,
  validateSkill,
  validateSkillUpdate,
  validateSkillCreate,
  validateProjectField,
  validateSkillField,
  validateProjectsBulk,
  validateSkillsBulk,
} from './validators';
import {
  ValidationResult,
  ValidationError,
  FieldValidationState,
  FormValidationState,
  ValidationContext,
  BulkValidationResult,
} from './types';
import { MigrationUtils } from './migrations';

/**
 * Hook for validating individual fields in real-time
 */
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  initialValue?: unknown
) {
  const [value, setValue] = useState(initialValue);
  const [validationState, setValidationState] = useState<FieldValidationState>({
    isValid: true,
    isDirty: false,
    isTouched: false,
    errors: [],
    warnings: [],
  });

  const validate = useCallback(
    (newValue: unknown) => {
      try {
        schema.parse(newValue);
        setValidationState(prev => ({
          ...prev,
          isValid: true,
          errors: [],
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setValidationState(prev => ({
            ...prev,
            isValid: false,
            errors: error.errors.map(err => err.message),
          }));
        }
      }
    },
    [schema]
  );

  const updateValue = useCallback(
    (newValue: unknown) => {
      setValue(newValue);
      setValidationState(prev => ({
        ...prev,
        isDirty: true,
      }));
      validate(newValue);
    },
    [validate]
  );

  const markTouched = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      isTouched: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setValidationState({
      isValid: true,
      isDirty: false,
      isTouched: false,
      errors: [],
      warnings: [],
    });
  }, [initialValue]);

  return {
    value,
    validationState,
    updateValue,
    markTouched,
    reset,
    validate: () => validate(value),
  };
}

/**
 * Hook for form-level validation
 */
export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  initialData?: Partial<T>
) {
  const [data, setData] = useState<Partial<T>>(initialData || {});
  const [formState, setFormState] = useState<FormValidationState>({
    isValid: false,
    isDirty: false,
    isSubmitting: false,
    fields: {},
    globalErrors: [],
  });

  const validateForm = useCallback(
    (formData: Partial<T>) => {
      try {
        schema.parse(formData);
        setFormState(prev => ({
          ...prev,
          isValid: true,
          globalErrors: [],
        }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Record<string, FieldValidationState> = {};
          const globalErrors: string[] = [];

          error.errors.forEach(err => {
            const fieldPath = err.path.join('.');
            if (fieldPath) {
              if (!fieldErrors[fieldPath]) {
                fieldErrors[fieldPath] = {
                  isValid: false,
                  isDirty: true,
                  isTouched: true,
                  errors: [],
                  warnings: [],
                };
              }
              fieldErrors[fieldPath].errors.push(err.message);
            } else {
              globalErrors.push(err.message);
            }
          });

          setFormState(prev => ({
            ...prev,
            isValid: false,
            fields: { ...prev.fields, ...fieldErrors },
            globalErrors,
          }));
        }
        return false;
      }
    },
    [schema]
  );

  const updateField = useCallback(
    (fieldPath: string, value: unknown) => {
      const newData = { ...data };
      const pathParts = fieldPath.split('.');
      let current: any = newData;

      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }

      // Set the value
      current[pathParts[pathParts.length - 1]] = value;

      setData(newData);
      setFormState(prev => ({
        ...prev,
        isDirty: true,
        fields: {
          ...prev.fields,
          [fieldPath]: {
            ...prev.fields[fieldPath],
            isDirty: true,
            isTouched: true,
          },
        },
      }));

      // Validate the entire form
      validateForm(newData);
    },
    [data, validateForm]
  );

  const markFieldTouched = useCallback((fieldPath: string) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldPath]: {
          ...prev.fields[fieldPath],
          isTouched: true,
        },
      },
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData || {});
    setFormState({
      isValid: false,
      isDirty: false,
      isSubmitting: false,
      fields: {},
      globalErrors: [],
    });
  }, [initialData]);

  const submit = useCallback(
    async (onSubmit: (data: T) => Promise<void>) => {
      setSubmitting(true);

      try {
        const isValid = validateForm(data);
        if (isValid) {
          await onSubmit(data as T);
          reset();
        }
      } catch (error) {
        setFormState(prev => ({
          ...prev,
          globalErrors: [
            error instanceof Error ? error.message : 'Submission failed',
          ],
        }));
      } finally {
        setSubmitting(false);
      }
    },
    [data, validateForm, reset]
  );

  return {
    data,
    formState,
    updateField,
    markFieldTouched,
    setSubmitting,
    reset,
    submit,
    validate: () => validateForm(data),
  };
}

/**
 * Hook for project validation
 */
export function useProjectValidation(
  mode: 'create' | 'update' | 'view' = 'create'
) {
  const validateFn = useMemo(() => {
    switch (mode) {
      case 'create':
        return validateProjectCreate;
      case 'update':
        return validateProjectUpdate;
      default:
        return validateProject;
    }
  }, [mode]);

  const validateField = useCallback((fieldPath: string, value: unknown) => {
    return validateProjectField(fieldPath, value);
  }, []);

  const validateBulk = useCallback(
    (projects: unknown[], context?: ValidationContext) => {
      return validateProjectsBulk(projects, context);
    },
    []
  );

  const autoMigrate = useCallback(async (data: any) => {
    return MigrationUtils.autoMigrate(data, 'project');
  }, []);

  return {
    validate: validateFn,
    validateField,
    validateBulk,
    autoMigrate,
  };
}

/**
 * Hook for skill validation
 */
export function useSkillValidation(
  mode: 'create' | 'update' | 'view' = 'create'
) {
  const validateFn = useMemo(() => {
    switch (mode) {
      case 'create':
        return validateSkillCreate;
      case 'update':
        return validateSkillUpdate;
      default:
        return validateSkill;
    }
  }, [mode]);

  const validateField = useCallback((fieldPath: string, value: unknown) => {
    return validateSkillField(fieldPath, value);
  }, []);

  const validateBulk = useCallback(
    (skills: unknown[], context?: ValidationContext) => {
      return validateSkillsBulk(skills, context);
    },
    []
  );

  const autoMigrate = useCallback(async (data: any) => {
    return MigrationUtils.autoMigrate(data, 'skill');
  }, []);

  return {
    validate: validateFn,
    validateField,
    validateBulk,
    autoMigrate,
  };
}

/**
 * Hook for real-time validation with debouncing
 */
export function useDebounceValidation<T>(
  validator: (data: unknown) => ValidationResult<T>,
  delay = 300
) {
  const [validationResult, setValidationResult] =
    useState<ValidationResult<T> | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    (data: unknown) => {
      setIsValidating(true);

      const timeoutId = setTimeout(() => {
        const result = validator(data);
        setValidationResult(result);
        setIsValidating(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    },
    [validator, delay]
  );

  return {
    validationResult,
    isValidating,
    validate,
  };
}

/**
 * Hook for batch validation operations
 */
export function useBatchValidation<T>() {
  const [results, setResults] = useState<BulkValidationResult<T> | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateBatch = useCallback(
    async (
      items: unknown[],
      validator: (
        items: unknown[],
        context?: ValidationContext
      ) => BulkValidationResult<T>,
      context?: ValidationContext
    ) => {
      setIsValidating(true);

      try {
        // Use setTimeout to make it async and allow UI updates
        const result = await new Promise<BulkValidationResult<T>>(resolve => {
          setTimeout(() => {
            resolve(validator(items, context));
          }, 0);
        });

        setResults(result);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return {
    results,
    isValidating,
    validateBatch,
    reset,
  };
}

/**
 * Hook for schema migration operations
 */
export function useSchemaMigration() {
  const [migrationState, setMigrationState] = useState<{
    isLoading: boolean;
    progress: number;
    currentItem: number;
    totalItems: number;
    errors: string[];
  }>({
    isLoading: false,
    progress: 0,
    currentItem: 0,
    totalItems: 0,
    errors: [],
  });

  const migrateData = useCallback(
    async (
      data: any,
      schemaType: 'project' | 'skill',
      targetVersion = '1.0.0'
    ) => {
      setMigrationState(prev => ({ ...prev, isLoading: true, errors: [] }));

      try {
        const result = await MigrationUtils.autoMigrate(
          data,
          schemaType,
          targetVersion
        );

        if (!result.success) {
          setMigrationState(prev => ({
            ...prev,
            errors: result.errors || [],
          }));
        }

        return result;
      } finally {
        setMigrationState(prev => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const migrateBatch = useCallback(
    async (
      items: any[],
      schemaType: 'project' | 'skill',
      targetVersion = '1.0.0',
      onProgress?: (progress: number, currentItem: number) => void
    ) => {
      setMigrationState({
        isLoading: true,
        progress: 0,
        currentItem: 0,
        totalItems: items.length,
        errors: [],
      });

      try {
        const result = await MigrationUtils.batchMigrate(
          items,
          schemaType,
          targetVersion
        );

        // Simulate progress updates for better UX
        for (let i = 0; i <= items.length; i++) {
          const progress = (i / items.length) * 100;
          setMigrationState(prev => ({
            ...prev,
            progress,
            currentItem: i,
          }));

          onProgress?.(progress, i);

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (result.failed.length > 0) {
          setMigrationState(prev => ({
            ...prev,
            errors: result.failed.map(f => f.error),
          }));
        }

        return result;
      } finally {
        setMigrationState(prev => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setMigrationState({
      isLoading: false,
      progress: 0,
      currentItem: 0,
      totalItems: 0,
      errors: [],
    });
  }, []);

  return {
    migrationState,
    migrateData,
    migrateBatch,
    reset,
  };
}

/**
 * Hook for validation metrics and performance monitoring
 */
export function useValidationMetrics() {
  const [metrics, setMetrics] = useState<{
    totalValidations: number;
    averageTime: number;
    errorRate: number;
    recentValidations: Array<{
      timestamp: number;
      duration: number;
      success: boolean;
      fieldCount: number;
    }>;
  }>({
    totalValidations: 0,
    averageTime: 0,
    errorRate: 0,
    recentValidations: [],
  });

  const recordValidation = useCallback(
    (duration: number, success: boolean, fieldCount: number) => {
      setMetrics(prev => {
        const newValidation = {
          timestamp: Date.now(),
          duration,
          success,
          fieldCount,
        };

        const recentValidations = [
          ...prev.recentValidations.slice(-99), // Keep last 100
          newValidation,
        ];

        const totalValidations = prev.totalValidations + 1;
        const totalTime = prev.averageTime * prev.totalValidations + duration;
        const averageTime = totalTime / totalValidations;

        const errors = recentValidations.filter(v => !v.success).length;
        const errorRate = errors / recentValidations.length;

        return {
          totalValidations,
          averageTime,
          errorRate,
          recentValidations,
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setMetrics({
      totalValidations: 0,
      averageTime: 0,
      errorRate: 0,
      recentValidations: [],
    });
  }, []);

  return {
    metrics,
    recordValidation,
    reset,
  };
}
