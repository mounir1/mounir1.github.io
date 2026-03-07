import React, { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { type Project, PROJECTS_COLLECTION } from '@/hooks/useProjects';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Archive,
  RefreshCw,
  Settings,
  CheckCircle2,
  Clock,
  Pause,
  AlertTriangle,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Separator } from '@/components/ui/separator';

interface ProjectBulkActionsProps {
  projects: Project[];
  onComplete: () => void;
  onCancel: () => void;
}

type BulkActionType = 'update' | 'delete' | 'export';

interface BulkUpdateData {
  status?: 'completed' | 'in-progress' | 'maintenance' | 'archived';
  featured?: boolean;
  disabled?: boolean;
  priority?: number;
  category?: string;
}

export function ProjectBulkActions({
  projects,
  onComplete,
  onCancel,
}: ProjectBulkActionsProps) {
  const [activeTab, setActiveTab] = useState<BulkActionType>('update');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form state
  const [updateData, setUpdateData] = useState<BulkUpdateData>({});
  const [updateFields, setUpdateFields] = useState<Set<keyof BulkUpdateData>>(
    new Set()
  );

  const handleFieldToggle = useCallback(
    (field: keyof BulkUpdateData, enabled: boolean) => {
      setUpdateFields(prev => {
        const newSet = new Set(prev);
        if (enabled) {
          newSet.add(field);
        } else {
          newSet.delete(field);
          // Clear the value when disabling the field
          setUpdateData(prevData => {
            const newData = { ...prevData };
            delete newData[field];
            return newData;
          });
        }
        return newSet;
      });
    },
    []
  );

  const handleBulkUpdate = useCallback(async () => {
    if (!db || projects.length === 0 || updateFields.size === 0) {
      toast({
        title: 'No changes to apply',
        description: 'Please select at least one field to update.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);

      projects.forEach(project => {
        const projectRef = doc(db!, PROJECTS_COLLECTION, project.id);
        const updates: Partial<Project> = {
          updatedAt: Date.now(),
        };

        // Only include fields that are selected for update
        updateFields.forEach(field => {
          if (updateData[field] !== undefined) {
            (updates as any)[field] = updateData[field];
          }
        });

        batch.update(projectRef, updates);
      });

      await batch.commit();

      toast({
        title: 'Bulk update successful',
        description: `${projects.length} projects have been updated successfully.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error updating projects:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [projects, updateData, updateFields, onComplete]);

  const handleBulkDelete = useCallback(async () => {
    if (!db || projects.length === 0) return;

    setIsProcessing(true);

    try {
      const batch = writeBatch(db);

      projects.forEach(project => {
        const projectRef = doc(db!, PROJECTS_COLLECTION, project.id);
        batch.delete(projectRef);
      });

      await batch.commit();
      setShowDeleteConfirm(false);

      toast({
        title: 'Projects deleted',
        description: `${projects.length} projects have been deleted successfully.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [projects, onComplete]);

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      try {
        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'csv') {
          // CSV Export
          const headers = [
            'Title',
            'Description',
            'Category',
            'Status',
            'Technologies',
            'Featured',
            'Visible',
            'Priority',
            'Live URL',
            'GitHub URL',
            'Start Date',
            'End Date',
            'Team Size',
            'Role',
            'Created At',
            'Updated At',
          ];

          const rows = projects.map(project => [
            project.title,
            project.description.replace(/"/g, '""'), // Escape quotes
            project.category,
            project.status,
            project.technologies.join('; '),
            project.featured ? 'Yes' : 'No',
            project.disabled ? 'No' : 'Yes',
            project.priority.toString(),
            project.liveUrl || '',
            project.githubUrl || '',
            project.startDate || '',
            project.endDate || '',
            project.teamSize?.toString() || '',
            project.role || '',
            new Date(project.createdAt).toLocaleDateString(),
            new Date(project.updatedAt).toLocaleDateString(),
          ]);

          content = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
          ].join('\n');

          filename = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
        } else {
          // JSON Export
          const exportData = projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            longDescription: project.longDescription,
            category: project.category,
            status: project.status,
            technologies: project.technologies,
            tags: project.tags,
            achievements: project.achievements,
            image: project.image,
            logo: project.logo,
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            demoUrl: project.demoUrl,
            featured: project.featured,
            disabled: project.disabled,
            priority: project.priority,
            startDate: project.startDate,
            endDate: project.endDate,
            duration: project.duration,
            teamSize: project.teamSize,
            role: project.role,
            challenges: project.challenges,
            solutions: project.solutions,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          }));

          content = JSON.stringify(exportData, null, 2);
          filename = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
        }

        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export successful',
          description: `${projects.length} projects exported as ${format.toUpperCase()}.`,
        });

        onComplete();
      } catch (error) {
        console.error('Error exporting projects:', error);
        toast({
          title: 'Export failed',
          description: 'Failed to export projects. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [projects, onComplete]
  );

  return (
    <div className="space-y-6">
      {/* Selected Projects Summary */}
      <div className="rounded-lg bg-muted p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">
            Selected Projects ({projects.length})
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {projects.slice(0, 5).map(project => (
            <Badge key={project.id} variant="secondary" className="text-xs">
              {project.title}
            </Badge>
          ))}
          {projects.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{projects.length - 5} more
            </Badge>
          )}
        </div>
      </div>

      {/* Action Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as BulkActionType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="update" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Update
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="delete" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </TabsTrigger>
        </TabsList>

        {/* Update Tab */}
        <TabsContent value="update" className="space-y-4">
          <div className="space-y-4">
            {/* Status Update */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Status</Label>
                <div className="text-sm text-muted-foreground">
                  Change the status of all selected projects
                </div>
              </div>
              <Switch
                checked={updateFields.has('status')}
                onCheckedChange={checked =>
                  handleFieldToggle('status', checked)
                }
              />
            </div>

            {updateFields.has('status') && (
              <Select
                value={updateData.status || ''}
                onValueChange={value =>
                  setUpdateData(prev => ({ ...prev, status: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-yellow-600" />
                      Maintenance
                    </div>
                  </SelectItem>
                  <SelectItem value="archived">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-gray-600" />
                      Archived
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <Separator />

            {/* Featured Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Featured Status</Label>
                <div className="text-sm text-muted-foreground">
                  Mark projects as featured or unfeatured
                </div>
              </div>
              <Switch
                checked={updateFields.has('featured')}
                onCheckedChange={checked =>
                  handleFieldToggle('featured', checked)
                }
              />
            </div>

            {updateFields.has('featured') && (
              <div className="flex items-center gap-4">
                <Button
                  variant={updateData.featured === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setUpdateData(prev => ({ ...prev, featured: true }))
                  }
                >
                  <Star className="mr-2 h-4 w-4" />
                  Feature All
                </Button>
                <Button
                  variant={
                    updateData.featured === false ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setUpdateData(prev => ({ ...prev, featured: false }))
                  }
                >
                  <Star className="mr-2 h-4 w-4" />
                  Unfeature All
                </Button>
              </div>
            )}

            <Separator />

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Visibility</Label>
                <div className="text-sm text-muted-foreground">
                  Show or hide projects from portfolio
                </div>
              </div>
              <Switch
                checked={updateFields.has('disabled')}
                onCheckedChange={checked =>
                  handleFieldToggle('disabled', checked)
                }
              />
            </div>

            {updateFields.has('disabled') && (
              <div className="flex items-center gap-4">
                <Button
                  variant={
                    updateData.disabled === false ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setUpdateData(prev => ({ ...prev, disabled: false }))
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Show All
                </Button>
                <Button
                  variant={updateData.disabled === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setUpdateData(prev => ({ ...prev, disabled: true }))
                  }
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide All
                </Button>
              </div>
            )}

            <Separator />

            {/* Priority Update */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Priority</Label>
                <div className="text-sm text-muted-foreground">
                  Set the same priority for all selected projects
                </div>
              </div>
              <Switch
                checked={updateFields.has('priority')}
                onCheckedChange={checked =>
                  handleFieldToggle('priority', checked)
                }
              />
            </div>

            {updateFields.has('priority') && (
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[updateData.priority || 50]}
                  onValueChange={value =>
                    setUpdateData(prev => ({ ...prev, priority: value[0] }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Low Priority</span>
                  <span className="font-medium">
                    {updateData.priority || 50}
                  </span>
                  <span>High Priority</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={isProcessing || updateFields.size === 0}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Update {projects.length} Projects
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="space-y-4 text-center">
            <div>
              <h3 className="mb-2 font-semibold">Export Projects</h3>
              <p className="text-sm text-muted-foreground">
                Download the selected projects in your preferred format
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="max-w-[200px] flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="max-w-[200px] flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              CSV format is ideal for spreadsheet applications.
              <br />
              JSON format preserves all data structure and relationships.
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </TabsContent>

        {/* Delete Tab */}
        <TabsContent value="delete" className="space-y-4">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-destructive">
                Delete Projects
              </h3>
              <p className="text-sm text-muted-foreground">
                This action will permanently delete {projects.length} selected
                projects. This cannot be undone.
              </p>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="text-sm">
                <strong>Projects to be deleted:</strong>
                <ul className="mt-2 space-y-1 text-left">
                  {projects.slice(0, 10).map(project => (
                    <li key={project.id} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-destructive"></span>
                      {project.title}
                    </li>
                  ))}
                  {projects.length > 10 && (
                    <li className="text-muted-foreground">
                      ... and {projects.length - 10} more projects
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {projects.length} Projects
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete {projects.length}{' '}
              projects? This action cannot be undone and will permanently remove
              all project data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
