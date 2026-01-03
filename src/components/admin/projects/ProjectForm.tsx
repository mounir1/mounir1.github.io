import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useProjects, PROJECTS_COLLECTION, DEFAULT_PROJECT, type ProjectInput, type ProjectCategory, type ProjectStatus } from "@/hooks/useProjects";
import type { Project } from "@/types/project";
import { firebaseService } from "@/lib/services/firebaseService";

import {
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  Globe,
  Github,
  Calendar,
  Users,
  Target,
  Award,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form validation schema - aligned with Project interface
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  achievements: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  lessons: z.array(z.string()).default([]),
  collaborators: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  priority: z.number().min(0).max(100).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: () => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultExpanded: boolean;
}

const formSections: FormSection[] = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Essential project details and description",
    icon: Info,
    defaultExpanded: true,
  },
  {
    id: "technical",
    title: "Technical Details",
    description: "Technologies, achievements, and technical specifications",
    icon: Zap,
    defaultExpanded: true,
  },
  {
    id: "links",
    title: "Links & Resources",
    description: "URLs for live site, repository, and documentation",
    icon: Globe,
    defaultExpanded: false,
  },
  {
    id: "timeline",
    title: "Timeline & Team",
    description: "Project timeline, duration, and team information",
    icon: Calendar,
    defaultExpanded: false,
  },
  {
    id: "insights",
    title: "Project Insights",
    description: "Challenges faced, lessons learned, and collaborators",
    icon: Target,
    defaultExpanded: false,
  },
  {
    id: "settings",
    title: "Display Settings",
    description: "Visibility, priority, and portfolio display options",
    icon: Award,
    defaultExpanded: false,
  },
];

export function ProjectForm({ project, onSubmit, onCancel, mode }: ProjectFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(formSections.filter(s => s.defaultExpanded).map(s => s.id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with project data or defaults
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      title: project.title,
      description: project.description,
      category: project.category,
      role: project.role,
      status: project.status,
      technologies: project.technologies,
      achievements: project.achievements || [],
      challenges: project.challenges || [],
      lessons: project.lessons || [],
      collaborators: project.collaborators || [],
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      images: project.images || [],
      featured: project.featured || false,
      disabled: project.disabled || false,
      priority: project.priority,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    } : {
      title: "",
      description: "",
      category: "",
      role: "",
      status: "",
      technologies: [],
      achievements: [],
      challenges: [],
      lessons: [],
      collaborators: [],
      liveUrl: "",
      githubUrl: "",
      images: [],
      featured: false,
      disabled: false,
      priority: 50,
      startDate: "",
      endDate: "",
    },
  });

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

  const handleSubmit = useCallback(async (data: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      const projectData: ProjectInput = {
        ...data,
        createdAt: project?.createdAt || Date.now(),
        updatedAt: Date.now(),
        version: project?.version || 1,
      };

      if (mode === "edit" && project?.id) {
        await firebaseService.updateProject(project.id, projectData);
        toast({
          title: "Project updated",
          description: `"${data.title}" has been updated successfully.`,
        });
      } else {
        await firebaseService.createProject(projectData);
        toast({
          title: "Project created",
          description: `"${data.title}" has been created successfully.`,
        });
      }

      onSubmit();
    } catch (error) {
      console.error("Error saving project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: `Failed to save project: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [project, mode, onSubmit]);

  // Helper function to add/remove items from arrays
  const addArrayItem = useCallback((fieldName: keyof ProjectFormData, value: string) => {
    const currentValue = form.getValues(fieldName) as string[];
    if (value.trim() && !currentValue.includes(value.trim())) {
      form.setValue(fieldName, [...currentValue, value.trim()]);
    }
  }, [form]);

  const removeArrayItem = useCallback((fieldName: keyof ProjectFormData, index: number) => {
    const currentValue = form.getValues(fieldName) as string[];
    form.setValue(fieldName, currentValue.filter((_, i) => i !== index));
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formSections.map((section) => {
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
                  className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">{section.title}</div>
                      <div className="text-sm text-muted-foreground">{section.description}</div>
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
                {section.id === "basic" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter project title" {...field} />
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
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Web Application">Web Application</SelectItem>
                                <SelectItem value="Mobile Application">Mobile Application</SelectItem>
                                <SelectItem value="Enterprise Integration">Enterprise Integration</SelectItem>
                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                                <SelectItem value="API Development">API Development</SelectItem>
                                <SelectItem value="DevOps & Infrastructure">DevOps & Infrastructure</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description for project cards and listings"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be shown in project cards and search results (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {section.id === "technical" && (
                  <>
                    <div>
                      <Label>Technologies Used *</Label>
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {form.watch("technologies").map((tech, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tech}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeArrayItem("technologies", index)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add technology (e.g., React, Node.js)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addArrayItem("technologies", input.value);
                              input.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            addArrayItem("technologies", input.value);
                            input.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>


                    <div>
                      <Label>Key Achievements</Label>
                      <div className="space-y-2 mt-2 mb-2">
                        {form.watch("achievements").map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="flex-1 text-sm">{achievement}</span>
                            <X
                              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                              onClick={() => removeArrayItem("achievements", index)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add achievement (e.g., Improved performance by 40%)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addArrayItem("achievements", input.value);
                              input.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            addArrayItem("achievements", input.value);
                            input.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {section.id === "links" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="liveUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Live URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/username/repo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                )}

                {section.id === "timeline" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Your Role *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Full-Stack Developer, Team Lead" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {section.id === "insights" && (
                  <>
                    <div>
                      <Label>Challenges Faced</Label>
                      <div className="space-y-2 mt-2 mb-2">
                        {form.watch("challenges").map((challenge, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                            <span className="flex-1 text-sm">{challenge}</span>
                            <X
                              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive mt-0.5"
                              onClick={() => removeArrayItem("challenges", index)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Describe a challenge you faced during this project"
                          className="min-h-[60px]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              const textarea = e.target as HTMLTextAreaElement;
                              addArrayItem("challenges", textarea.value);
                              textarea.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const textarea = (e.target as HTMLElement).previousElementSibling as HTMLTextAreaElement;
                            addArrayItem("challenges", textarea.value);
                            textarea.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Lessons Learned</Label>
                      <div className="space-y-2 mt-2 mb-2">
                        {form.watch("lessons").map((lesson, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                            <span className="flex-1 text-sm">{lesson}</span>
                            <X
                              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive mt-0.5"
                              onClick={() => removeArrayItem("lessons", index)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Describe key lessons learned from this project"
                          className="min-h-[60px]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              const textarea = e.target as HTMLTextAreaElement;
                              addArrayItem("lessons", textarea.value);
                              textarea.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const textarea = (e.target as HTMLElement).previousElementSibling as HTMLTextAreaElement;
                            addArrayItem("lessons", textarea.value);
                            textarea.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Collaborators</Label>
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {form.watch("collaborators").map((collaborator, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {collaborator}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeArrayItem("collaborators", index)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add collaborator (e.g., Jane Doe, John Smith)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addArrayItem("collaborators", input.value);
                              input.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            addArrayItem("collaborators", input.value);
                            input.value = "";
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {section.id === "settings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Featured Project</Label>
                        <div className="text-sm text-muted-foreground">
                          Show this project prominently on your portfolio
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem>
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

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hide from Portfolio</Label>
                        <div className="text-sm text-muted-foreground">
                          Keep this project private and hidden from public view
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="disabled"
                        render={({ field }) => (
                          <FormItem>
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

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority (0-100)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Low Priority</span>
                                <span className="font-medium">{field.value}</span>
                                <span>High Priority</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Higher priority projects appear first in listings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "edit" ? "Update Project" : "Create Project"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}