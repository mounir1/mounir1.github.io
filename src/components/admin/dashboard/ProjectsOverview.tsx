import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Project {
  name: string;
  description: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'planned';
  technologies: string[];
}

const projects: Project[] = [
  {
    name: 'Portfolio Website',
    description: 'Personal portfolio website built with Next.js',
    progress: 100,
    status: 'completed',
    technologies: ['Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    name: 'Admin Dashboard',
    description: 'Enhanced admin dashboard with analytics',
    progress: 75,
    status: 'in-progress',
    technologies: ['React', 'TypeScript', 'Vite'],
  },
  {
    name: 'Mobile App',
    description: 'Cross-platform mobile application',
    progress: 30,
    status: 'in-progress',
    technologies: ['React Native', 'Firebase'],
  },
  {
    name: 'API Gateway',
    description: 'API Gateway with authentication',
    progress: 0,
    status: 'planned',
    technologies: ['Node.js', 'Express', 'MongoDB'],
  },
];

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-500';
    case 'in-progress':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'planned':
      return 'bg-blue-500/10 text-blue-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export const ProjectsOverview: React.FC = () => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold">Projects Overview</h3>
        <p className="text-sm text-muted-foreground">
          Track the progress of your ongoing projects
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Technologies</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.name}>
              <TableCell>
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(project.status)}
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Progress value={project.progress} />
                  <p className="text-sm text-muted-foreground">
                    {project.progress}% complete
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map(tech => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
