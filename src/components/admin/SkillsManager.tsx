import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useSkills } from "@/hooks/useSkills";
import { type Skill, type SkillInput, SkillSchema } from "@/lib/schema/skillSchema";
import { SkillCategory } from "@/lib/schema/types";
import { doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { createActionColumnDef } from "@/components/admin/ActionColumn";
import { getSkillIcon, getSkillColor } from "@/lib/skill-icons";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Award,
  Check,
  ChevronDown,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Star,
  Trash2,
  RefreshCw,
  Trash,
  AlertCircle,
  Code,
  Server,
  Palette,
  Layers,
  Cpu,
  Database as DatabaseIcon,
  Globe,
  PencilRuler,
  BarChart,
  FileText,
  LayoutPanelLeft,
  Calendar,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataExportManager } from "@/components/admin/DataExportManager";
import { ImageUpload } from "@/components/admin/ImageUpload";

// Function to get level label based on proficiency value
const getLevelLabel = (level: number) => {
  if (level < 30) return "Beginner";
  if (level < 60) return "Intermediate";
  if (level < 85) return "Advanced";
  return "Expert";
};

// Map of category to icon
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Frontend Development": <Code className="h-4 w-4" />,
  "Backend Development": <Server className="h-4 w-4" />,
  "Database": <DatabaseIcon className="h-4 w-4" />,
  "Cloud & DevOps": <Globe className="h-4 w-4" />,
  "Mobile Development": <Layers className="h-4 w-4" />,
  "Machine Learning": <Cpu className="h-4 w-4" />,
  "Design": <Palette className="h-4 w-4" />,
  "Project Management": <BarChart className="h-4 w-4" />,
  "Languages": <FileText className="h-4 w-4" />,
  "Tools": <PencilRuler className="h-4 w-4" />,
  "LMS & Education": <Award className="h-4 w-4" />,
  "Hospitality Solutions": <Calendar className="h-4 w-4" />,
  "Other": <LayoutPanelLeft className="h-4 w-4" />,
};

export function SkillsManager() {
  const { skills, loading, addSkill, updateSkill, deleteSkill, refetch } = useSkills();
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [skillsToDelete, setSkillsToDelete] = useState<Skill[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [iconUrl, setIconUrl] = useState<string>("");
  const [iconPath, setIconPath] = useState<string>("");

  // Form setup
  const form = useForm<SkillInput>({
    resolver: zodResolver(SkillSchema),
    defaultValues: {
      name: "",
      category: SkillCategory.FRONTEND_DEVELOPMENT,
      level: 50,
      proficiency: 50,
      yearsOfExperience: 0,
      description: "",
      featured: false,
      disabled: false,
      priority: 50,
      icon: "",
      color: "",
      certifications: [],
      projects: [],
      tags: [],
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    form.reset({
      name: "",
      category: SkillCategory.FRONTEND_DEVELOPMENT,
      level: 50,
      proficiency: 50,
      yearsOfExperience: 0,
      description: "",
      featured: false,
      disabled: false,
      priority: 50,
      icon: "",
      color: "",
      certifications: [],
      projects: [],
      tags: [],
    });
  }, [form]);

  // Handle add skill
  const handleAddSkill = useCallback(() => {
    setSkillToEdit(null);
    resetForm();
    setIconUrl("");
    setIconPath("");
    setIsFormOpen(true);
  }, [resetForm]);

  // Handle form submission with enhanced validation and error handling
  const onSubmit = async (values: SkillInput) => {
    try {
      // Show loading state
      toast({
        title: skillToEdit ? "Updating skill..." : "Creating skill...",
        description: "Please wait while we save your skill.",
        duration: 3000,
      });

      // Ensure level is a number for the slider
      const levelValue = typeof values.level === 'number' ? values.level : 50;

      // Sync proficiency with level if needed
      const finalValues = {
        ...values,
        proficiency: values.proficiency || levelValue,
        level: levelValue // Store as number for simplicity in this UI
      };

      if (skillToEdit) {
        // Check if this is a local skill (can't be updated in Firebase)
        if (skillToEdit.id.startsWith('local-') || skillToEdit.id.startsWith('fallback-')) {
          toast({
            title: "Cannot Edit Local Skill",
            description: "This is a local/demo skill. Please create a new skill instead.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        // Update existing skill
        await updateSkill(skillToEdit.id, {
          ...finalValues,
          icon: iconUrl || values.icon,
          updatedAt: Date.now(),
        } as Partial<Skill>);

        toast({
          title: "Skill updated successfully",
          description: `"${values.name}" has been updated and synced to Firebase.`,
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } else {
        // Add new skill
        await addSkill({
          ...finalValues,
          icon: iconUrl || values.icon || "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as SkillInput);

        toast({
          title: "Skill created successfully",
          description: `"${values.name}" has been added to your skills and synced to Firebase.`,
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      }

      setIsFormOpen(false);
      resetForm();
      setIconUrl("");
      setIconPath("");
      refetch();
    } catch (error) {
      console.error("Error saving skill:", error);
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('permission')) {
          errorMessage = "You don't have permission to modify skills. Please check your access rights.";
        } else if (errorMessage.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
      }

      toast({
        title: "Failed to save skill",
        description: `Error: ${errorMessage}. Please try again or contact support if the issue persists.`,
        variant: "destructive",
        duration: 7000,
        className: "bg-red-500 text-white",
        action: (
          <Button
            variant="outline"
            onClick={() => console.log("Error details:", error)}
            className="text-white border-white hover:bg-white hover:text-red-500"
          >
            View Details
          </Button>
        )
      });
    }
  };

  // Handle edit skill
  const handleEditSkill = useCallback((skill: Skill) => {
    setSkillToEdit(skill);

    // Handle level potentially being an Enum or number
    let levelValue = 50;
    if (typeof skill.level === 'number') {
      levelValue = skill.level;
    } else {
      // Map Enum to number if needed, or just default
      levelValue = 50;
    }

    form.reset({
      name: skill.name,
      category: skill.category,
      level: levelValue,
      proficiency: skill.proficiency || levelValue,
      yearsOfExperience: skill.yearsOfExperience || (skill.experience?.years || 0),
      description: skill.description || "",
      featured: skill.featured,
      disabled: skill.disabled,
      priority: skill.priority,
      icon: skill.icon || "",
      color: skill.color || "",
      certifications: skill.certifications || [],
      projects: skill.projects || [],
      tags: skill.tags || [],
    });
    setIconUrl(skill.icon || "");
  }, [form]);

  // Handle delete skill
  const handleDeleteSkill = useCallback((skill: Skill) => {
    setSkillToDelete(skill);
  }, []);

  // Confirm delete skill
  const confirmDeleteSkill = useCallback(async () => {
    if (!skillToDelete || !db) return;

    try {
      // Check if this is a local skill (can't be deleted from Firebase)
      if (skillToDelete.id.startsWith('local-') || skillToDelete.id.startsWith('fallback-')) {
        toast({
          title: "Cannot Delete Local Skill",
          description: "This is a local/demo skill and cannot be deleted.",
          variant: "destructive",
        });
        setSkillToDelete(null);
        return;
      }

      await deleteSkill(skillToDelete.id);
      toast({
        title: "Skill deleted",
        description: `${skillToDelete.name} has been deleted successfully.`,
      });
      setSkillToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting skill:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to delete skill",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [skillToDelete, deleteSkill, refetch]);

  // Handle bulk delete
  const handleBulkDelete = useCallback((skills: Skill[]) => {
    setSkillsToDelete(skills);
    setBulkDeleteOpen(true);
  }, []);

  // Confirm bulk delete
  const confirmBulkDelete = useCallback(async () => {
    if (skillsToDelete.length === 0 || !db) return;

    try {
      const batch = writeBatch(db);
      const deletableSkills = skillsToDelete.filter(
        skill => !skill.id.startsWith('local-') && !skill.id.startsWith('fallback-')
      );

      if (deletableSkills.length === 0) {
        toast({
          title: "Cannot Delete Local Skills",
          description: "Local/demo skills cannot be deleted.",
          variant: "destructive",
          duration: 5000,
        });
        setBulkDeleteOpen(false);
        setSkillsToDelete([]);
        return;
      }

      // Show loading state
      toast({
        title: "Deleting skills...",
        description: `Preparing to delete ${deletableSkills.length} skills.`,
        duration: 3000,
      });

      deletableSkills.forEach((skill) => {
        if (db) {
          const skillRef = doc(db, "skills", skill.id);
          batch.delete(skillRef);
        }
      });

      await batch.commit();

      toast({
        title: "Skills deleted successfully",
        description: `${deletableSkills.length} skills have been permanently deleted from Firebase.`,
        duration: 5000,
        className: "bg-green-500 text-white",
      });

      setBulkDeleteOpen(false);
      setSkillsToDelete([]);
      refetch();
    } catch (error) {
      console.error("Error deleting skills:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Failed to delete skills",
        description: `Error: ${errorMessage}. Please try again later.`,
        variant: "destructive",
        duration: 7000,
        className: "bg-red-500 text-white",
        action: (
          <Button
            variant="outline"
            onClick={() => console.log("Error details:", error)}
            className="text-white border-white hover:bg-white hover:text-red-500"
          >
            View Details
          </Button>
        )
      });
    }
  }, [skillsToDelete, refetch]);

  // Columns definition
  const columns: ColumnDef<Skill>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{row.original.icon}</span>
          <span>{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {CATEGORY_ICONS[row.original.category] || <LayoutPanelLeft className="h-4 w-4" />}
          <span>{row.getValue("category")}</span>
        </div>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.original.level;
        const val = typeof level === 'number' ? level : 50;
        return (
          <div className="flex items-center gap-2">
            <Progress
              value={val}
              className="w-24"
              indicatorClassName="bg-primary"
            />
            <span className="text-sm text-muted-foreground w-8">{val}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "yearsOfExperience",
      header: "Years",
      cell: ({ row }) => {
        const years = row.original.yearsOfExperience || row.original.experience?.years || 0;
        return <span>{years}</span>;
      }
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (
        row.getValue("featured") ?
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> :
          <Star className="h-4 w-4 text-muted-foreground" />
      ),
    },
    {
      accessorKey: "disabled",
      header: "Status",
      cell: ({ row }) => (
        row.getValue("disabled") ?
          <Badge variant="destructive">Disabled</Badge> :
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
      ),
    },
    createActionColumnDef({
      onEdit: handleEditSkill,
      onDelete: handleDeleteSkill,
    }),
  ];

  // Filter options
  const categoryOptions = useMemo(() => {
    const categories = Object.values(SkillCategory);
    return categories.map(cat => ({ label: cat, value: cat }));
  }, []);

  const statusOptions = useMemo(() => [
    { label: "Active", value: "false" },
    { label: "Disabled", value: "true" },
  ], []);

  return (
    <div className="space-y-6">
      <DataExportManager />

      <Card className="border-0 shadow-medium bg-card text-card-foreground">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold font-heading">Skills Management</CardTitle>
              <CardDescription className="font-sans leading-relaxed">
                Manage your technical skills and expertise
              </CardDescription>
            </div>
            <Button onClick={handleAddSkill} className="shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-80 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : (
            <AdminDataTable
              title="Skills"
              columns={columns}
              data={skills}
              loading={loading}
              searchPlaceholder="Search skills..."
              filterFields={[
                {
                  key: "category",
                  title: "Category",
                  options: categoryOptions,
                },
                {
                  key: "disabled",
                  title: "Status",
                  options: statusOptions,
                },
              ]}
              onRefresh={refetch}
              onDelete={handleBulkDelete}
              onAdd={handleAddSkill}
            />
          )}
        </CardContent>
      </Card>

      {/* Skill Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open && form.formState.isDirty) {
          resetForm();
          setIconUrl("");
          setIconPath("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>{skillToEdit ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              {skillToEdit
                ? "Update the skill details below"
                : "Fill in the details for your new skill"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Use div instead of ScrollArea to maintain scroll position when form is long */}
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., React, Node.js"
                            {...field}
                            className="bg-background text-foreground border-input"
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
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background text-foreground border-input">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(SkillCategory).map((category) => (
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

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[typeof field.value === 'number' ? field.value : 50]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-2"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Beginner</span>
                          <span className="font-medium">
                            {field.value}% - {getLevelLabel(typeof field.value === 'number' ? field.value : 50)}
                          </span>
                          <span>Expert</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-background text-foreground border-input"
                          />
                        </FormControl>
                        <FormDescription>
                          How many years have you been using this skill?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., code, database"
                            {...field}
                            className="bg-background text-foreground border-input"
                          />
                        </FormControl>
                        <FormDescription>
                          Icon name from Lucide Icons (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background text-foreground border-input">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-input"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Show this skill in the featured section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background text-foreground border-input">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-input"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Disabled</FormLabel>
                          <FormDescription>
                            Hide this skill from public view
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <DialogFooter className="gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                    setIconUrl("");
                    setIconPath("");
                  }}
                  className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="shadow-glow"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : skillToEdit ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Skill
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!skillToDelete} onOpenChange={() => setSkillToDelete(null)}>
        <AlertDialogContent className="bg-background text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the skill <strong>{skillToDelete?.name}</strong>.
              {skillToDelete?.id.startsWith('local-') || skillToDelete?.id.startsWith('fallback-') ? (
                <span className="block mt-2 text-yellow-500 font-medium">
                  Note: Local/demo skills cannot be deleted from Firebase.
                </span>
              ) : (
                <span className="block mt-2 text-red-500">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSkill}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={(open) => {
        setBulkDeleteOpen(open);
        if (!open) {
          setSkillsToDelete([]);
        }
      }}>
        <AlertDialogContent className="bg-background text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Skills</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{skillsToDelete.length}</strong> skills.
              {skillsToDelete.some(s => s.id.startsWith('local-') || s.id.startsWith('fallback-')) ? (
                <span className="block mt-2 text-yellow-500 font-medium">
                  Note: Local/demo skills cannot be deleted and will be skipped.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setBulkDeleteOpen(false)}
              className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}