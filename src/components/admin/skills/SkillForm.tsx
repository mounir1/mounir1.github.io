import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SkillInput } from '@/hooks/useSkills';
import type { Skill } from '@/types/skill';
import { SkillCategory } from '@/lib/schema/types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.coerce.number().min(1).max(100),
  proficiency: z.coerce.number().min(0).max(100).default(50),
  experience: z
    .object({
      years: z.coerce.number().min(0).default(1),
      months: z.coerce.number().min(0).max(11).default(0),
    })
    .default({ years: 1, months: 0 }),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  priority: z.coerce.number().min(1).max(100).default(50),
  icon: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type SkillFormValues = z.infer<typeof formSchema>;

export type SkillFormProps = {
  mode: 'create' | 'edit';
  skill?: Skill;
  onSubmit: (values: SkillInput | SkillFormValues) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
};

export const SkillForm: React.FC<SkillFormProps> = ({
  mode,
  skill,
  onSubmit,
  onCancel,
  loading = false,
  error,
}) => {
  const [proficiencyValue, setProficiencyValue] = useState(
    skill?.proficiency || 50
  );
  const [tagsInput, setTagsInput] = useState(skill?.tags?.join(', ') || '');

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill?.name || '',
      category: skill?.category || '',
      level: typeof skill?.level === 'string' ? 50 : skill?.level || 50,
      proficiency: skill?.proficiency || 50,
      experience: {
        years: skill?.experience?.years || 1,
        months: skill?.experience?.months || 0,
      },
      description: skill?.description || '',
      featured: skill?.featured || false,
      disabled: skill?.disabled || false,
      priority: skill?.priority || 50,
      icon: skill?.icon || '',
      color: skill?.color || '',
      tags: skill?.tags || [],
    },
  });

  // Get categories from the SkillCategory enum
  const categories = Object.values(SkillCategory);

  function onSubmitHandler(values: SkillFormValues) {
    // Parse tags from comma-separated string
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const submitData = {
      ...values,
      tags,
      proficiency: proficiencyValue,
    };

    onSubmit(submitData);
  }

  const getSubmitButtonText = () => {
    if (loading) {
      return mode === 'create' ? 'Adding...' : 'Updating...';
    }
    return mode === 'create' ? 'Add Skill' : 'Update Skill';
  };

  const getFormTitle = () => {
    return mode === 'create' ? 'Add New Skill' : 'Edit Skill';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{getFormTitle()}</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill Name</FormLabel>
                <FormControl>
                  <Input placeholder="Skill name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <FormControl>
                    <Input
                      type="range"
                      min={1}
                      max={100}
                      {...field}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Rate your skill level from 1 to 100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience.years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="experience.months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Months</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={11}
                      {...field}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Proficiency</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={proficiencyValue}
                  onChange={e => {
                    const value = Math.max(0, Math.min(100, +e.target.value));
                    setProficiencyValue(value);
                  }}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  {proficiencyValue}%
                </div>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your experience with this skill"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <Input
              placeholder="Enter tags separated by commas"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Skill</FormLabel>
                    <FormDescription>
                      Display this skill prominently
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
                      Hide this skill from display
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Higher values appear first</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {getSubmitButtonText()}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
