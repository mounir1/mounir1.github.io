import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, isFirebaseEnabled } from './firebase';

// Sample project data for seeding
const sampleProjects = [
  {
    title: 'Portfolio Website',
    description:
      'A modern, responsive portfolio website built with React and TypeScript',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    githubUrl: 'https://github.com/example/portfolio',
    liveUrl: 'https://example.com',
    featured: true,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-02-15',
    category: 'web',
    imageUrl: '/placeholder.svg',
  },
  {
    title: 'Task Management App',
    description:
      'A full-stack task management application with real-time updates',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    githubUrl: 'https://github.com/example/task-app',
    liveUrl: 'https://task-app.example.com',
    featured: true,
    status: 'completed',
    startDate: '2023-10-01',
    endDate: '2023-12-20',
    category: 'web',
    imageUrl: '/placeholder.svg',
  },
  {
    title: 'E-commerce Platform',
    description: 'A scalable e-commerce platform with payment integration',
    technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
    githubUrl: 'https://github.com/example/ecommerce',
    featured: false,
    status: 'in-progress',
    startDate: '2024-03-01',
    category: 'web',
    imageUrl: '/placeholder.svg',
  },
];

export const seedInitialData = async (): Promise<boolean> => {
  try {
    // Check if Firebase is enabled and db is available
    if (!isFirebaseEnabled || !db) {
      console.log('Firebase not enabled or db not available, skipping seed');
      return false;
    }

    // Check if projects already exist
    const projectsSnapshot = await getDocs(collection(db, 'projects'));

    if (!projectsSnapshot.empty) {
      console.log('Projects already exist, skipping seed');
      return false;
    }

    // Add sample projects
    const projectsCollection = collection(db, 'projects');

    for (const project of sampleProjects) {
      await addDoc(projectsCollection, {
        ...project,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('Successfully seeded initial data');
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false; // Return false instead of throwing to prevent app crash
  }
};
