/**
 * Enhanced Skill Form Component with Advanced CRUD Operations
 * @author Mounir Abderrahmani
 * @description Comprehensive form for creating and editing skills with validation,
 * real-time feedback, and optimized user experience
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import {
  SkillSchema,
  SkillCreateSchema,
  type Skill,
  type SkillInput,
} from '@/lib/schema/skillSchema';
import { SkillCategory, SkillLevel } from '@/lib/schema/types';
import { skillService } from '@/lib/services/adminDataService';
import { getSkillIcon, getSkillColor } from '@/lib/skill-icons';
import { format } from 'date-fns';

import {
  Save,
  X,
  Plus,
  Trash2,
  Award,
  Calendar,
  Link as LinkIcon,
  BookOpen,
  Target,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  Upload,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';

// ============================================================================
// Form Schema
// ============================================================================

const skillFormSchema = SkillCreateSchema.omit({
  createdAt: true,
  updatedAt: true,
  version: true,
  schemaVersion: true,
}).extend({
  // Make some fields optional for the form
  certifications: z.array(
    z.object({
      name: z.string().min(1, 'Certificate name is required'),
      issuer: z.string().min(1, 'Issuer is required'),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      credentialId: z.string().optional(),
      url: z.string().optional(),
      verified: z.boolean().default(false),
      score: z.number().optional(),
    })
  ).default([]),
  learningResources: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      url: z.string().optional(),
      type: z.enum([
        'course',
        'book',
        'article',
        'video',
        'documentation',
        'tutorial',
        'workshop',
        'other',
      ]),
      provider: z.string().optional(),
      duration: z.string().optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      completed: z.boolean().default(false),
      rating: z.number().optional(),
      notes: z.string().optional(),
    })
  ).default([]),
  projects: z.array(z.string()).default([]),
  relatedSkills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

type SkillFormData = z.infer<typeof skillFormSchema>;

// ============================================================================
// Form Sections Configuration
// ============================================================================

interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultExpanded: boolean;
}

const formSections: FormSection[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Essential skill details and classification',
    icon: Info,
    defaultExpanded: true,
  },
  {
    id: 'proficiency',
    title: 'Proficiency & Experience',
    description: 'Skill level, years of experience, and expertise',
    icon: Award,
    defaultExpanded: true,
  },
  {
    id: 'details',
    title: 'Additional Details',
    description: 'Description, tags, and visual settings',
    icon: Target,
    defaultExpanded: false,
  },
  {
    id: 'certifications',
    title: 'Certifications',
    description: 'Professional certifications and credentials',
    icon: Award,
    defaultExpanded: false,
  },
  {
    id: 'learning',
    title: 'Learning Resources',
    description: 'Courses, books, and learning materials',
    icon: BookOpen,
    defaultExpanded: false,
  },
  {
    id: 'relationships',
    title: 'Projects & Related Skills',
    description: 'Associated projects and related skills',
    icon: LinkIcon,
    defaultExpanded: false,
  },
];

// ============================================================================
// Component Props
// ============================================================================

interface SkillFormProps {
  skill?: Skill | null;
  onSubmit: () => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

// ============================================================================
// Helper Functions
// ============================================================================

const getLevelLabel = (level: number): string => {
  if (level < 30) return 'Beginner';
  if (level < 60) return 'Intermediate';
  if (level < 85) return 'Advanced';
  return 'Expert';
};

const getLevelColor = (level: number): string => {
  if (level < 30) return 'text-blue-500';
  if (level < 60) return 'text-yellow-500';
  if (level < 85) return 'text-orange-500';
  return 'text-green-500';
};

// ============================================================================
// Main Component
// ============================================================================

export function EnhancedSkillForm({
  skill,
  onSubmit,
  onCancel,
  mode,
}: SkillFormProps) {
  // State management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(formSections.filter(s => s.defaultExpanded).map(s => s.id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [showPreview, setShowPreview] = useState(false);
  const [iconUrl, setIconUrl] = useState<string>('');
  const [confirmClose, setConfirmClose] = useState(false);

  // Initialize form
  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: useMemo(() => {
      if (skill) {
        return {
          name: skill.name,
          category: skill.category,
          level: typeof skill.level === 'number' ? skill.level : 50,
          proficiency: skill.proficiency || (typeof skill.level === 'number' ? skill.level : 50),
          yearsOfExperience: skill.yearsOfExperience || skill.experience?.years || 0,
          description: skill.description || '',
          featured: skill.featured || false,
          disabled: skill.disabled || false,
          priority: skill.priority || 50,
          icon: skill.icon || '',
          color: skill.color || '',
          certifications: skill.certifications || [],
          learningResources: skill.learningResources || [],
          projects: skill.projects || [],
          relatedSkills: skill.relatedSkills || [],
          tags: skill.tags || [],
          visibility: skill.visibility || 'public',
        };
      }

      return {
        name: '',
        category: SkillCategory.FRONTEND_DEVELOPMENT,
        level: 50,
        proficiency: 50,
        yearsOfExperience: 0,
        description: '',
        featured: false,
        disabled: false,
        priority: 50,
        icon: '',
        color: '',
        certifications: [],
        learningResources: [],
        projects: [],
        relatedSkills: [],
        tags: [],
        visibility: 'public',
      };
    }, [skill]),
  });

  // Field arrays for nested data
  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: 'certifications',
  });

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control: form.control,
    name: 'learningResources',
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: SkillFormData) => {
      setIsSubmitting(true);

      try {
        // Prepare skill data
        const skillData: SkillInput = {
          ...data,
          icon: iconUrl || data.icon,
          color: data.color || getSkillColor(data.category),
          createdAt: skill?.createdAt || Date.now(),
          updatedAt: Date.now(),
          version: (skill?.version || 1) + 1,
          schemaVersion: '1.0.0',
        };

        let result;
        if (mode === 'edit' && skill?.id) {
          // Check if this is a local skill
          if (
            skill.id.startsWith('local-') ||
            skill.id.startsWith('fallback-')
          ) {
            toast({
              title: 'Cannot Edit Local Skill',
              description:
                'This is a local/demo skill. Please create a new skill instead.',
              variant: 'destructive',
              duration: 5000,
            });
            setIsSubmitting(false);
            return;
          }

          result = await skillService.updateSkill(skill.id, skillData);
        } else {
          result = await skillService.createSkill(skillData);
        }

        if (result.success) {
          toast({
            title: mode === 'edit' ? 'Skill updated' : 'Skill created',
            description: `"${data.name}" has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`,
            className: 'bg-green-500 text-white',
          });
          onSubmit();
        } else {
          throw result.error || new Error('Failed to save skill');
        }
      } catch (error) {
        console.error('Error saving skill:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        toast({
          title: 'Failed to save skill',
          description: errorMessage,
          variant: 'destructive',
          duration: 7000,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [skill, mode, onSubmit, iconUrl]
  );

  // Handle tag input
  const handleAddTag = useCallback(
    (value: string) => {
      if (value.trim() && !form.getValues('tags').includes(value.trim())) {
        appendTag(value.trim());
      }
    },
    [appendTag, form]
  );

  // Handle certification add
  const handleAddCertification = useCallback(() => {
    appendCertification({
      name: '',
      issuer: '',
      issueDate: undefined,
      expiryDate: undefined,
      credentialId: undefined,
      url: undefined,
      verified: false,
      score: undefined,
    });
  }, [appendCertification]);

  // Handle learning resource add
  const handleAddResource = useCallback(() => {
    appendResource({
      title: '',
      url: undefined,
      type: 'course',
      provider: undefined,
      duration: undefined,
      difficulty: 'intermediate',
      completed: false,
      rating: undefined,
      notes: undefined,
    });
  }, [appendResource]);

  // Watch proficiency for preview
  const watchedProficiency = form.watch('proficiency');
  const watchedLevel = form.watch('level');
  const watchedCategory = form.watch('category');

  // Render form sections
  const renderBasicSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., React, Node.js, Python"
                  {...field}
                  className="font-medium"
                />
              </FormControl>
              <FormDescription>
                The name of the skill or technology
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SkillCategory).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The category this skill belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tags */}
      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="mb-2 flex flex-wrap gap-2">
              {tagFields.map((tag, index) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="gap-1 px-3 py-1"
                >
                  {tag.value}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    handleAddTag(input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder="Add a tag and press Enter"]'
                  ) as HTMLInputElement;
                  if (input) {
                    handleAddTag(input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormDescription>
              Add tags to help categorize and search for this skill
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );

  const renderProficiencySection = () => (
    <div className="space-y-6">
      {/* Proficiency Slider */}
      <FormField
        control={form.control}
        name="proficiency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proficiency Level</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[typeof field.value === 'number' ? field.value : 50]}
                  onValueChange={vals => field.onChange(vals[0])}
                  className="py-2"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={typeof field.value === 'number' ? field.value : 50}
                      className="w-32"
                    />
                    <span className={`text-sm font-medium ${getLevelColor(typeof field.value === 'number' ? field.value : 50)}`}>
                      {typeof field.value === 'number' ? field.value : 50}%
                    </span>
                  </div>
                  <Badge variant="outline" className={getLevelColor(typeof field.value === 'number' ? field.value : 50)}>
                    {getLevelLabel(typeof field.value === 'number' ? field.value : 50)}
                  </Badge>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Your proficiency level with this skill (0-100%)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Years of Experience */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Total years using this skill
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Priority</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[field.value]}
                  onValueChange={vals => field.onChange(vals[0])}
                  className="py-2"
                />
              </FormControl>
              <FormDescription>
                Higher priority = shown first (current: {field.value})
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Status Toggles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured</FormLabel>
                <FormDescription>
                  Show in featured skills section
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Disabled</FormLabel>
                <FormDescription>
                  Hide from public view
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderDetailsSection = () => (
    <div className="space-y-4">
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of your expertise with this skill..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional description of your experience with this skill
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Icon and Color */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., code, database, server"
                  {...field}
                  value={iconUrl || field.value}
                />
              </FormControl>
              <FormDescription>
                Lucide icon name or custom icon URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Color</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="#000000"
                    {...field}
                    className="w-32"
                  />
                  <Input
                    type="color"
                    value={field.value || '#000000'}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Custom color for this skill (hex format)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Visibility */}
      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visibility</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Control who can see this skill
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderCertificationsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Certifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCertification}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {certificationFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No certifications added yet</p>
          <p className="text-sm">
            Add professional certifications for this skill
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificationFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Certification #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`certifications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Certificate name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`certifications.${index}.issuer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Issuing organization" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`certifications.${index}.issueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`certifications.${index}.credentialId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Credential ID" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderLearningSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Learning Resources</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddResource}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {resourceFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No learning resources added yet</p>
          <p className="text-sm">
            Add courses, books, or tutorials related to this skill
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resourceFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Resource #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`learningResources.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Resource title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`learningResources.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="course">Course</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`learningResources.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Preview Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {activeTab === 'form' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Form Sections */}
            {formSections.map(section => {
              const isExpanded = expandedSections.has(section.id);
              const SectionIcon = section.icon;

              return (
                <Collapsible
                  key={section.id}
                  open={isExpanded}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between rounded-lg border p-4 hover:bg-muted/50"
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold">{section.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {section.description}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-4 px-4">
                    {section.id === 'basic' && renderBasicSection()}
                    {section.id === 'proficiency' && renderProficiencySection()}
                    {section.id === 'details' && renderDetailsSection()}
                    {section.id === 'certifications' && renderCertificationsSection()}
                    {section.id === 'learning' && renderLearningSection()}
                    {section.id === 'relationships' && (
                      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                        <LinkIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>Project associations coming soon</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === 'edit' ? 'Update Skill' : 'Create Skill'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: form.getValues('color') || getSkillColor(watchedCategory),
                }}
              >
                {getSkillIcon(form.getValues('icon') || iconUrl, 'h-8 w-8')}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{form.getValues('name') || 'Skill Name'}</h3>
                <Badge variant="outline" className="mt-1">
                  {watchedCategory}
                </Badge>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={watchedProficiency} className="w-32" />
                    <span className={`font-medium ${getLevelColor(watchedProficiency)}`}>
                      {watchedProficiency}%
                    </span>
                    <Badge variant="secondary">
                      {getLevelLabel(watchedProficiency)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {form.getValues('yearsOfExperience')} years of experience
                  </p>
                  {form.getValues('description') && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {form.getValues('description')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedSkillForm;
