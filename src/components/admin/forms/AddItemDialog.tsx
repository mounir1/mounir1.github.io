import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectForm } from './ProjectForm';
import { SkillForm } from './SkillForm';
import { ExperienceForm } from './ExperienceForm';
import { Plus } from 'lucide-react';

interface AddItemDialogProps {
  type: 'project' | 'skill' | 'experience';
  onSuccess?: () => void;
}

export function AddItemDialog({ type, onSuccess }: AddItemDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const renderForm = () => {
    switch (type) {
      case 'project':
        return <ProjectForm onSuccess={handleSuccess} />;
      case 'skill':
        return <SkillForm onSuccess={handleSuccess} />;
      case 'experience':
        return <ExperienceForm onSuccess={handleSuccess} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'project':
        return 'Add New Project';
      case 'skill':
        return 'Add New Skill';
      case 'experience':
        return 'Add New Experience';
      default:
        return 'Add New Item';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
