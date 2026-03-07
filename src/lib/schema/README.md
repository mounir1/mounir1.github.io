# Database Schema Validation System

A comprehensive, type-safe validation system for projects and skills data with migration support, transformers, and React hooks.

## Features

- 🔍 **Comprehensive Validation**: Zod-based schemas with detailed error reporting
- 🔄 **Data Transformation**: Convert legacy data formats to new schema-compliant structures
- 📈 **Schema Migration**: Automatic migration between schema versions
- ⚛️ **React Hooks**: Easy integration with React forms and components
- 📊 **Bulk Operations**: Validate multiple items efficiently
- 🎯 **Type Safety**: Full TypeScript support with inferred types
- 📝 **Field-level Validation**: Real-time form validation support

## Quick Start

### Basic Validation

```typescript
import { validateProject, validateSkill } from '@/lib/schema';

// Validate a project
const projectResult = validateProject(projectData);
if (projectResult.success) {
  console.log('Valid project:', projectResult.data);
} else {
  console.log('Validation errors:', projectResult.errors);
}

// Validate a skill
const skillResult = validateSkill(skillData);
if (skillResult.success) {
  console.log('Valid skill:', skillResult.data);
}
```

### Using React Hooks

```typescript
import { useProjectValidation, useFormValidation } from '@/lib/schema';

function ProjectForm() {
  const { validate, validateField } = useProjectValidation('create');
  const { data, formState, updateField, submit } = useFormValidation(ProjectCreateSchema);

  const handleSubmit = async (validatedData) => {
    // Save to database
    await saveProject(validatedData);
  };

  return (
    <form onSubmit={() => submit(handleSubmit)}>
      <input
        value={data.title || ''}
        onChange={(e) => updateField('title', e.target.value)}
        className={formState.fields.title?.isValid ? '' : 'error'}
      />
      {formState.fields.title?.errors.map(error => (
        <span key={error} className="error">{error}</span>
      ))}
    </form>
  );
}
```

### Legacy Data Migration

```typescript
import { MigrationUtils } from '@/lib/schema';

// Auto-detect and migrate legacy data
const migrationResult = await MigrationUtils.autoMigrate(legacyData, 'project');
if (migrationResult.success) {
  console.log('Migrated data:', migrationResult.migratedData);
}

// Batch migration
const batchResult = await MigrationUtils.batchMigrate(legacyItems, 'project');
console.log(`Migrated ${batchResult.successful.length} items`);
```

## Schema Structure

### Project Schema

```typescript
interface Project {
  // Basic Information
  title: string;
  description: string;
  longDescription?: string;

  // Classification
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;

  // Technical Details
  technologies: string[];
  achievements: string[];
  challenges: string[];
  solutions: string[];
  tags: string[];

  // Media and Links
  images: ProjectImage[];
  links: ProjectLink[];
  icon?: string;

  // Project Details
  featured: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'draft';

  // Timeline
  startDate?: Date;
  endDate?: Date;
  duration?: string;

  // Team and Role
  teamSize: number;
  role: string;

  // Client and Business
  clientInfo?: ClientInfo;
  metrics?: ProjectMetrics;

  // SEO and Metadata
  seo?: ProjectSEO;

  // System Fields
  createdAt: number;
  updatedAt: number;
  version: number;
  schemaVersion: string;
}
```

### Skill Schema

```typescript
interface Skill {
  // Basic Information
  name: string;

  // Classification
  category: SkillCategory;
  level: SkillLevel;
  proficiency: number; // 0-100

  // Experience
  experience: SkillExperience;

  // Description and Details
  description?: string;

  // Certifications and Learning
  certifications: Certification[];
  learningResources: LearningResource[];
  learningPath: LearningPath;

  // Related Data
  projects: string[];
  relatedSkills: string[];

  // Visual and Metadata
  icon?: string;
  color?: string;

  // Status and Organization
  featured: boolean;
  disabled: boolean;
  visibility: 'public' | 'private';
  priority: number;
  tags: string[];

  // System Fields
  createdAt: number;
  updatedAt: number;
  version: number;
  schemaVersion: string;
}
```

## Validation Rules

### Project Validation

- **Title**: Required, 1-100 characters, no whitespace-only
- **Description**: Required, 10-500 characters for basic, 50+ for featured projects
- **Technologies**: At least one technology required
- **Dates**: End date must be after start date, completed projects need end date
- **Images**: At most one primary image
- **Links**: At most one primary link
- **SEO Slug**: Lowercase letters, numbers, and hyphens only

### Skill Validation

- **Name**: Required, 1-50 characters, not just numbers
- **Proficiency**: 0-100, increments of 5 (except 90+)
- **Level vs Proficiency**: Must align (Beginner: 0-30, Intermediate: 25-60, Advanced: 55-85, Expert: 80-100)
- **Featured Skills**: Must have 70+ proficiency
- **High Proficiency**: Skills 80+ must have experience or certifications
- **Experience Dates**: Last used must be after first used

## Migration System

The system supports automatic migration between schema versions:

### Available Versions

**Projects:**

- `0.1.0`: Initial legacy format
- `0.2.0`: Added client info and metrics
- `0.3.0`: Converted single image/logo to images array
- `0.4.0`: Converted individual URLs to links array
- `1.0.0`: Full schema compliance

**Skills:**

- `0.1.0`: Initial legacy format
- `0.2.0`: Added proficiency separate from level
- `0.3.0`: Converted yearsOfExperience to experience object
- `0.4.0`: Structured certifications format
- `1.0.0`: Full schema compliance

### Migration Example

```typescript
// Automatic version detection and migration
const currentVersion = MigrationUtils.detectDataVersion(data, 'project');
const result = await MigrationUtils.autoMigrate(data, 'project', '1.0.0');

// Manual migration between specific versions
const result = await migrationExecutor.migrate(
  'project',
  data,
  '0.3.0',
  '1.0.0'
);
```

## React Hooks

### useProjectValidation / useSkillValidation

```typescript
const { validate, validateField, validateBulk, autoMigrate } =
  useProjectValidation('create');
```

### useFormValidation

```typescript
const {
  data,
  formState,
  updateField,
  markFieldTouched,
  reset,
  submit,
  validate,
} = useFormValidation(schema, initialData);
```

### useFieldValidation

```typescript
const { value, validationState, updateValue, markTouched, reset, validate } =
  useFieldValidation(fieldSchema, initialValue);
```

### useBatchValidation

```typescript
const { results, isValidating, validateBatch, reset } = useBatchValidation();
```

### useSchemaMigration

```typescript
const { migrationState, migrateData, migrateBatch, reset } =
  useSchemaMigration();
```

## Error Handling

The system provides detailed error information:

```typescript
interface ValidationError {
  field: string; // Field path (e.g., 'clientInfo.name')
  message: string; // Human-readable error message
  code: string; // Error code for programmatic handling
  value?: unknown; // The invalid value
}
```

### Error Formatting

```typescript
import {
  formatValidationErrors,
  groupValidationErrorsByField,
} from '@/lib/schema';

// Format errors as a single string
const errorMessage = formatValidationErrors(result.errors);

// Group errors by field for form display
const errorsByField = groupValidationErrorsByField(result.errors);
```

## Performance

- **Field Validation**: ~0.1-1ms per field
- **Full Object Validation**: ~1-5ms per object
- **Bulk Validation**: ~1-10ms per 100 objects
- **Migration**: ~5-50ms per object depending on complexity

## Best Practices

1. **Use appropriate validation mode**: `create`, `update`, or `view`
2. **Validate on the client and server**: Never trust client-side validation alone
3. **Provide real-time feedback**: Use field-level validation for better UX
4. **Handle migration gracefully**: Always validate after migration
5. **Cache validation results**: Avoid re-validating unchanged data
6. **Use bulk operations**: For better performance with multiple items

## Examples

See `examples.ts` for comprehensive usage examples including:

- Basic validation
- Form integration
- Legacy data transformation
- Auto-migration
- Error handling
- Bulk operations

## Testing

Run the test suite:

```bash
npm test src/lib/schema/__tests__/
```

The test suite covers:

- Schema validation rules
- Edge cases and error conditions
- Migration functionality
- Transformer accuracy
- Performance benchmarks
