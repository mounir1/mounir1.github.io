import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code,
  Server,
  Database,
  Cpu,
  Sparkles,
  Cloud,
  Zap,
  Palette,
  Layers,
} from 'lucide-react';

interface SkillFormProps {
  skill?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const SkillForm: React.FC<SkillFormProps> = ({
  skill,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState({
    name: skill?.name || '',
    category: skill?.category || '',
    level: skill?.level || 50,
    yearsOfExperience: skill?.yearsOfExperience || 1,
    color: skill?.color || '#61DAFB',
    featured: skill?.featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Skill Name</label>
          <Input
            placeholder="e.g., React, Node.js"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className="border-input bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            The name of the skill or technology
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            onValueChange={value => handleChange('category', value)}
            value={formData.category}
          >
            <SelectTrigger className="border-input bg-background text-foreground">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover text-popover-foreground">
              <SelectItem
                value="Frontend Development"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  Frontend Development
                </div>
              </SelectItem>
              <SelectItem
                value="Backend Development"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-500" />
                  Backend Development
                </div>
              </SelectItem>
              <SelectItem
                value="Data Engineering"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  Data Engineering
                </div>
              </SelectItem>
              <SelectItem
                value="DevOps & Infrastructure"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-500" />
                  DevOps & Infrastructure
                </div>
              </SelectItem>
              <SelectItem
                value="Machine Learning"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Machine Learning
                </div>
              </SelectItem>
              <SelectItem
                value="Cloud Computing"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-sky-500" />
                  Cloud Computing
                </div>
              </SelectItem>
              <SelectItem
                value="API Development"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-500" />
                  API Development
                </div>
              </SelectItem>
              <SelectItem
                value="UI/UX Design"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-rose-500" />
                  UI/UX Design
                </div>
              </SelectItem>
              <SelectItem
                value="Other"
                className="focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  Other
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The category this skill belongs to
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Proficiency Level (1-100)
          </label>
          <div className="space-y-2">
            <Slider
              min={1}
              max={100}
              step={1}
              value={[formData.level]}
              onValueChange={vals => handleChange('level', vals[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>Beginner</span>
              <span className="font-medium">{formData.level}%</span>
              <span>Expert</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your proficiency level (1-100%)
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Years of Experience</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={formData.yearsOfExperience}
            onChange={e =>
              handleChange('yearsOfExperience', Number(e.target.value))
            }
            className="border-input bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Number of years using this skill
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Display Color</label>
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-md border border-input"
              style={{ backgroundColor: formData.color }}
            />
            <Input
              type="color"
              value={formData.color}
              onChange={e => handleChange('color', e.target.value)}
              className="h-10 cursor-pointer border-0 bg-transparent p-0"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Color for skill visualization
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Featured Status</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="featured-yes"
                checked={formData.featured === true}
                onChange={() => handleChange('featured', true)}
                className="h-4 w-4"
              />
              <label htmlFor="featured-yes" className="text-sm">
                Featured
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="featured-no"
                checked={formData.featured === false}
                onChange={() => handleChange('featured', false)}
                className="h-4 w-4"
              />
              <label htmlFor="featured-no" className="text-sm">
                Standard
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Should this skill be featured prominently?
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {skill ? 'Update Skill' : 'Add Skill'}
        </Button>
      </div>
    </form>
  );
};
