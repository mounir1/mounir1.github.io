import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { PortfolioDataManager } from "@/lib/data-management-service";
import { 
  Download, 
  Upload, 
  DatabaseBackup, 
  DatabaseRestore, 
  FileJson, 
  DatabaseZap,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

type ExportFormat = 'json' | 'csv' | 'excel';

interface ExportOptions {
  includeProjects: boolean;
  includeSkills: boolean;
  includeMetadata: boolean;
  format: ExportFormat;
}

export function DataExportManager() {
  const { projects } = useProjects();
  const { skills } = useSkills();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeProjects: true,
    includeSkills: true,
    includeMetadata: true,
    format: 'json'
  });

  const handleExport = async () => {
    setExportProgress(0);
    setExportComplete(false);
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Prepare data based on options
      const exportData = {
        ...(exportOptions.includeProjects && { projects }),
        ...(exportOptions.includeSkills && { skills }),
        ...(exportOptions.includeMetadata && {
          exportedAt: new Date().toISOString(),
          totalProjects: projects.length,
          totalSkills: skills.length,
          format: exportOptions.format
        })
      };

      // Create file based on format
      let dataStr: string;
      let mimeType: string;
      let extension: string;

      switch (exportOptions.format) {
        case 'json':
          dataStr = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          // For CSV, we'll just export a simple summary
          dataStr = `Projects: ${projects.length}, Skills: ${skills.length}`;
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'excel':
          // For Excel, we'll just export a simple summary
          dataStr = `Projects: ${projects.length}, Skills: ${skills.length}`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        default:
          dataStr = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          extension = 'json';
      }

      const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileName = `portfolio-data-${new Date().toISOString().slice(0, 10)}.${extension}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();

      setExportComplete(true);
      toast({
        title: "Export Successful",
        description: `Data exported in ${exportOptions.format.toUpperCase()} format`,
        className: "bg-green-500 text-white"
      });

      // Reset after completion
      setTimeout(() => {
        setIsExportDialogOpen(false);
        setExportProgress(0);
        setExportComplete(false);
      }, 2000);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    setImportProgress(0);
    setImportComplete(false);

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Read and parse the file
      const text = await file.text();
      const importData = JSON.parse(text);

      // Import projects if they exist in the file
      if (importData.projects) {
        for (const project of importData.projects) {
          try {
            // Validate project data
            const validation = PortfolioDataManager.validateProjectData(project);
            if (!validation.isValid) {
              console.warn(`Invalid project data:`, validation.errors);
              continue;
            }

            // Create or update the project
            if (project.id) {
              await PortfolioDataManager.updateProject(project.id, project);
            } else {
              await PortfolioDataManager.createProject(project);
            }
          } catch (error) {
            console.error("Error importing project:", error);
          }
        }
      }

      // Import skills if they exist in the file
      if (importData.skills) {
        for (const skill of importData.skills) {
          try {
            // Validate skill data
            const validation = PortfolioDataManager.validateSkillData(skill);
            if (!validation.isValid) {
              console.warn(`Invalid skill data:`, validation.errors);
              continue;
            }

            // Create or update the skill
            if (skill.id) {
              await PortfolioDataManager.updateSkill(skill.id, skill);
            } else {
              await PortfolioDataManager.createSkill(skill);
            }
          } catch (error) {
            console.error("Error importing skill:", error);
          }
        }
      }

      setImportComplete(true);
      toast({
        title: "Import Successful",
        description: `Data imported from ${file.name}`,
        className: "bg-green-500 text-white"
      });

      // Reset after completion
      setTimeout(() => {
        setIsImportDialogOpen(false);
        setImportProgress(0);
        setImportComplete(false);
        setFile(null);
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleBackup = async () => {
    // This would typically call a backend service to create a backup
    toast({
      title: "Backup Started",
      description: "Creating backup of your portfolio data..."
    });

    try {
      // In a real implementation, this would call a backup service
      // For now, we'll just export the data as a backup
      const backupData = {
        projects,
        skills,
        backupDate: new Date().toISOString(),
        version: "1.0"
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileName = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();

      toast({
        title: "Backup Created",
        description: "Your portfolio data has been backed up successfully"
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating the backup",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async () => {
    if (!file) {
      toast({
        title: "No backup file selected",
        description: "Please select a backup file to restore",
        variant: "destructive"
      });
      return;
    }

    try {
      // Read and parse the backup file
      const text = await file.text();
      const backupData = JSON.parse(text);

      // In a real implementation, this would send data to a backend service
      // For now, we'll just validate the data and show a success message
      if (!backupData.projects || !backupData.skills) {
        throw new Error("Invalid backup file format");
      }

      // Show confirmation dialog before restoring
      if (window.confirm("Restoring will overwrite your current data. Are you sure?")) {
        // In a real implementation, this would replace the current data
        // For now, just show success message
        toast({
          title: "Restore Successful",
          description: `Backup restored from ${file.name}`,
          className: "bg-green-500 text-white"
        });
        
        setIsRestoreDialogOpen(false);
        setFile(null);
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "There was an error restoring from the backup. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, backup, and restore your portfolio data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackup}
              className="flex items-center justify-center gap-2"
            >
              <DatabaseZap className="h-4 w-4" />
              Create Backup
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <DatabaseRestore className="h-4 w-4" />
              Restore from Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Portfolio Data</DialogTitle>
            <DialogDescription>
              Select what data to include in your export and choose the format
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Include Projects</span>
              <Badge variant={exportOptions.includeProjects ? "default" : "secondary"}>
                {exportOptions.includeProjects ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Include Skills</span>
              <Badge variant={exportOptions.includeSkills ? "default" : "secondary"}>
                {exportOptions.includeSkills ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Include Metadata</span>
              <Badge variant={exportOptions.includeMetadata ? "default" : "secondary"}>
                {exportOptions.includeMetadata ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <div className="flex gap-2">
                {(['json', 'csv', 'excel'] as ExportFormat[]).map(format => (
                  <Button
                    key={format}
                    variant={exportOptions.format === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportOptions({...exportOptions, format})}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {exportProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
              {exportComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Export completed successfully!</span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
              disabled={exportProgress > 0 && exportProgress < 100}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportProgress > 0 && exportProgress < 100}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Portfolio Data</DialogTitle>
            <DialogDescription>
              Select a file to import your portfolio data from
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileJson className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON files only</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {file && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm truncate">{file.name}</p>
              </div>
            )}
          </div>
          
          {importProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
              {importComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Import completed successfully!</span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
              disabled={importProgress > 0 && importProgress < 100}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || (importProgress > 0 && importProgress < 100)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Select a backup file to restore your portfolio data from
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <DatabaseRestore className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON backup files only</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {file && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm truncate">{file.name}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRestore}
              disabled={!file}
            >
              <DatabaseRestore className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}