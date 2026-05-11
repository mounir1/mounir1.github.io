import React from 'react';
import {
  Code,
  Server,
  Database,
  Globe,
  Smartphone,
  Brain,
  Palette,
  BarChart3,
  MessageSquare,
  Wrench,
  Layers,
  Zap,
  FileCode,
  Terminal,
  Box,
  Cloud,
  Shield,
  GitBranch,
  Cpu,
  HardDrive,
  MonitorSpeaker,
  PenTool,
  Figma,
  Camera,
  Video,
  Music,
  Command,
  Settings,
  Puzzle,
  Target,
  Compass,
  BookOpen,
  Coffee,
} from 'lucide-react';

// Define skill icon mappings with multiple variations
export const SKILL_ICONS: Record<string, React.ReactNode> = {
  // Frontend Development
  react: <Code className="h-4 w-4" style={{ color: '#61DAFB' }} />,
  vue: <Code className="h-4 w-4" style={{ color: '#4FC08D' }} />,
  angular: <Code className="h-4 w-4" style={{ color: '#DD0031' }} />,
  svelte: <Code className="h-4 w-4" style={{ color: '#FF3E00' }} />,
  'next.js': <Code className="h-4 w-4" style={{ color: '#000000' }} />,
  'nuxt.js': <Code className="h-4 w-4" style={{ color: '#00C58E' }} />,
  gatsby: <Code className="h-4 w-4" style={{ color: '#663399' }} />,
  html: <FileCode className="h-4 w-4" style={{ color: '#E34F26' }} />,
  html5: <FileCode className="h-4 w-4" style={{ color: '#E34F26' }} />,
  css: <Palette className="h-4 w-4" style={{ color: '#1572B6' }} />,
  css3: <Palette className="h-4 w-4" style={{ color: '#1572B6' }} />,
  sass: <Palette className="h-4 w-4" style={{ color: '#CC6699' }} />,
  scss: <Palette className="h-4 w-4" style={{ color: '#CC6699' }} />,
  less: <Palette className="h-4 w-4" style={{ color: '#1D365D' }} />,
  tailwindcss: <Palette className="h-4 w-4" style={{ color: '#06B6D4' }} />,
  bootstrap: <Palette className="h-4 w-4" style={{ color: '#7952B3' }} />,
  'material-ui': <Palette className="h-4 w-4" style={{ color: '#0081CB' }} />,
  'chakra-ui': <Palette className="h-4 w-4" style={{ color: '#319795' }} />,

  // JavaScript & TypeScript
  javascript: <Zap className="h-4 w-4" style={{ color: '#F7DF1E' }} />,
  typescript: <Zap className="h-4 w-4" style={{ color: '#3178C6' }} />,
  es6: <Zap className="h-4 w-4" style={{ color: '#F7DF1E' }} />,
  es2015: <Zap className="h-4 w-4" style={{ color: '#F7DF1E' }} />,

  // Backend Development
  'node.js': <Server className="h-4 w-4" style={{ color: '#339933' }} />,
  express: <Server className="h-4 w-4" style={{ color: '#000000' }} />,
  nestjs: <Server className="h-4 w-4" style={{ color: '#E0234E' }} />,
  fastify: <Server className="h-4 w-4" style={{ color: '#000000' }} />,
  koa: <Server className="h-4 w-4" style={{ color: '#33333D' }} />,
  php: <Server className="h-4 w-4" style={{ color: '#777BB4' }} />,
  laravel: <Server className="h-4 w-4" style={{ color: '#FF2D20' }} />,
  symfony: <Server className="h-4 w-4" style={{ color: '#000000' }} />,
  python: <Server className="h-4 w-4" style={{ color: '#3776AB' }} />,
  django: <Server className="h-4 w-4" style={{ color: '#092E20' }} />,
  flask: <Server className="h-4 w-4" style={{ color: '#000000' }} />,
  fastapi: <Server className="h-4 w-4" style={{ color: '#009688' }} />,
  java: <Server className="h-4 w-4" style={{ color: '#ED8B00' }} />,
  spring: <Server className="h-4 w-4" style={{ color: '#6DB33F' }} />,
  'spring boot': <Server className="h-4 w-4" style={{ color: '#6DB33F' }} />,
  'c#': <Server className="h-4 w-4" style={{ color: '#239120' }} />,
  '.net': <Server className="h-4 w-4" style={{ color: '#512BD4' }} />,
  'asp.net': <Server className="h-4 w-4" style={{ color: '#512BD4' }} />,
  ruby: <Server className="h-4 w-4" style={{ color: '#CC342D' }} />,
  rails: <Server className="h-4 w-4" style={{ color: '#CC0000' }} />,
  go: <Server className="h-4 w-4" style={{ color: '#00ADD8' }} />,
  rust: <Server className="h-4 w-4" style={{ color: '#000000' }} />,

  // Databases
  mysql: <Database className="h-4 w-4" style={{ color: '#4479A1' }} />,
  postgresql: <Database className="h-4 w-4" style={{ color: '#336791' }} />,
  mongodb: <Database className="h-4 w-4" style={{ color: '#47A248' }} />,
  redis: <Database className="h-4 w-4" style={{ color: '#DC382D' }} />,
  elasticsearch: <Database className="h-4 w-4" style={{ color: '#005571' }} />,
  sqlite: <Database className="h-4 w-4" style={{ color: '#003B57' }} />,
  oracle: <Database className="h-4 w-4" style={{ color: '#F80000' }} />,
  'sql server': <Database className="h-4 w-4" style={{ color: '#CC2927' }} />,
  firebase: <Database className="h-4 w-4" style={{ color: '#FFCA28' }} />,
  supabase: <Database className="h-4 w-4" style={{ color: '#3ECF8E' }} />,

  // Cloud & DevOps
  aws: <Cloud className="h-4 w-4" style={{ color: '#FF9900' }} />,
  azure: <Cloud className="h-4 w-4" style={{ color: '#0078D4' }} />,
  gcp: <Cloud className="h-4 w-4" style={{ color: '#4285F4' }} />,
  'google cloud': <Cloud className="h-4 w-4" style={{ color: '#4285F4' }} />,
  docker: <Box className="h-4 w-4" style={{ color: '#2496ED' }} />,
  kubernetes: <Box className="h-4 w-4" style={{ color: '#326CE5' }} />,
  terraform: <Cloud className="h-4 w-4" style={{ color: '#623CE4' }} />,
  ansible: <Cloud className="h-4 w-4" style={{ color: '#EE0000' }} />,
  jenkins: <Settings className="h-4 w-4" style={{ color: '#D33833' }} />,
  'gitlab ci': <GitBranch className="h-4 w-4" style={{ color: '#FC6D26' }} />,
  'github actions': (
    <GitBranch className="h-4 w-4" style={{ color: '#2088FF' }} />
  ),
  circleci: <GitBranch className="h-4 w-4" style={{ color: '#343434' }} />,

  // Mobile Development
  'react native': (
    <Smartphone className="h-4 w-4" style={{ color: '#61DAFB' }} />
  ),
  flutter: <Smartphone className="h-4 w-4" style={{ color: '#02569B' }} />,
  ionic: <Smartphone className="h-4 w-4" style={{ color: '#3880FF' }} />,
  cordova: <Smartphone className="h-4 w-4" style={{ color: '#E8E8E8' }} />,
  xamarin: <Smartphone className="h-4 w-4" style={{ color: '#3498DB' }} />,
  swift: <Smartphone className="h-4 w-4" style={{ color: '#FA7343' }} />,
  kotlin: <Smartphone className="h-4 w-4" style={{ color: '#7F52FF' }} />,
  'java android': (
    <Smartphone className="h-4 w-4" style={{ color: '#3DDC84' }} />
  ),

  // Machine Learning & AI
  tensorflow: <Brain className="h-4 w-4" style={{ color: '#FF6F00' }} />,
  pytorch: <Brain className="h-4 w-4" style={{ color: '#EE4C2C' }} />,
  'scikit-learn': <Brain className="h-4 w-4" style={{ color: '#F7931E' }} />,
  pandas: <Brain className="h-4 w-4" style={{ color: '#150458' }} />,
  numpy: <Brain className="h-4 w-4" style={{ color: '#013243' }} />,
  jupyter: <Brain className="h-4 w-4" style={{ color: '#F37626' }} />,
  opencv: <Brain className="h-4 w-4" style={{ color: '#5C3EE8' }} />,

  // Design & UI/UX
  figma: <PenTool className="h-4 w-4" style={{ color: '#F24E1E' }} />,
  sketch: <PenTool className="h-4 w-4" style={{ color: '#F7B500' }} />,
  'adobe xd': <PenTool className="h-4 w-4" style={{ color: '#FF61F6' }} />,
  photoshop: <Camera className="h-4 w-4" style={{ color: '#31A8FF' }} />,
  illustrator: <PenTool className="h-4 w-4" style={{ color: '#FF9A00' }} />,
  'after effects': <Video className="h-4 w-4" style={{ color: '#9999FF' }} />,
  'premiere pro': <Video className="h-4 w-4" style={{ color: '#9999FF' }} />,

  // Tools & Utilities
  git: <GitBranch className="h-4 w-4" style={{ color: '#F05032' }} />,
  github: <GitBranch className="h-4 w-4" style={{ color: '#181717' }} />,
  gitlab: <GitBranch className="h-4 w-4" style={{ color: '#FC6D26' }} />,
  bitbucket: <GitBranch className="h-4 w-4" style={{ color: '#0052CC' }} />,
  vscode: <Terminal className="h-4 w-4" style={{ color: '#007ACC' }} />,
  intellij: <Terminal className="h-4 w-4" style={{ color: '#000000' }} />,
  vim: <Terminal className="h-4 w-4" style={{ color: '#019733' }} />,
  emacs: <Terminal className="h-4 w-4" style={{ color: '#7F5AB6' }} />,
  webpack: <Settings className="h-4 w-4" style={{ color: '#8DD6F9' }} />,
  vite: <Zap className="h-4 w-4" style={{ color: '#646CFF' }} />,
  rollup: <Settings className="h-4 w-4" style={{ color: '#EC4A3F' }} />,
  parcel: <Settings className="h-4 w-4" style={{ color: '#E7A93F' }} />,
  babel: <Settings className="h-4 w-4" style={{ color: '#F9DC3E' }} />,
  eslint: <Shield className="h-4 w-4" style={{ color: '#4B32C3' }} />,
  prettier: <Shield className="h-4 w-4" style={{ color: '#F7B93E' }} />,
  jest: <Shield className="h-4 w-4" style={{ color: '#C21325' }} />,
  cypress: <Shield className="h-4 w-4" style={{ color: '#17202C' }} />,
  selenium: <Shield className="h-4 w-4" style={{ color: '#43B02A' }} />,

  // Project Management & Collaboration
  jira: <Target className="h-4 w-4" style={{ color: '#0052CC' }} />,
  trello: <Target className="h-4 w-4" style={{ color: '#0079BF' }} />,
  asana: <Target className="h-4 w-4" style={{ color: '#273347' }} />,
  slack: <MessageSquare className="h-4 w-4" style={{ color: '#4A154B' }} />,
  discord: <MessageSquare className="h-4 w-4" style={{ color: '#5865F2' }} />,
  'microsoft teams': (
    <MessageSquare className="h-4 w-4" style={{ color: '#6264A7' }} />
  ),
  notion: <BookOpen className="h-4 w-4" style={{ color: '#000000' }} />,
  confluence: <BookOpen className="h-4 w-4" style={{ color: '#172B4D' }} />,

  // Operating Systems
  linux: <Terminal className="h-4 w-4" style={{ color: '#FCC624' }} />,
  ubuntu: <Terminal className="h-4 w-4" style={{ color: '#E95420' }} />,
  centos: <Terminal className="h-4 w-4" style={{ color: '#262577' }} />,
  debian: <Terminal className="h-4 w-4" style={{ color: '#A81D33' }} />,
  windows: <MonitorSpeaker className="h-4 w-4" style={{ color: '#0078D6' }} />,
  macos: <Command className="h-4 w-4" style={{ color: '#000000' }} />,

  // Generic fallbacks
  frontend: <Globe className="h-4 w-4" />,
  backend: <Server className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
  ai: <Brain className="h-4 w-4" />,
  ml: <Brain className="h-4 w-4" />,
  design: <Palette className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4" />,
  devops: <Cloud className="h-4 w-4" />,
  testing: <Shield className="h-4 w-4" />,
  default: <Code className="h-4 w-4" />,
};

// Function to get skill icon by name with fallback logic
export function getSkillIcon(
  skillName: string,
  fallbackIcon?: React.ReactNode
): React.ReactNode {
  if (!skillName) return fallbackIcon || SKILL_ICONS.default;

  const normalizedName = skillName.toLowerCase().trim();

  // Direct match
  if (SKILL_ICONS[normalizedName]) {
    return SKILL_ICONS[normalizedName];
  }

  // Partial match for common variations
  const partialMatch = Object.keys(SKILL_ICONS).find(
    key => normalizedName.includes(key) || key.includes(normalizedName)
  );

  if (partialMatch) {
    return SKILL_ICONS[partialMatch];
  }

  // Category-based fallbacks
  if (
    normalizedName.includes('react') ||
    normalizedName.includes('vue') ||
    normalizedName.includes('angular')
  ) {
    return SKILL_ICONS.frontend;
  }

  if (
    normalizedName.includes('node') ||
    normalizedName.includes('express') ||
    normalizedName.includes('api')
  ) {
    return SKILL_ICONS.backend;
  }

  if (
    normalizedName.includes('sql') ||
    normalizedName.includes('db') ||
    normalizedName.includes('database')
  ) {
    return SKILL_ICONS.database;
  }

  if (
    normalizedName.includes('mobile') ||
    normalizedName.includes('ios') ||
    normalizedName.includes('android')
  ) {
    return SKILL_ICONS.mobile;
  }

  if (
    normalizedName.includes('ai') ||
    normalizedName.includes('ml') ||
    normalizedName.includes('machine')
  ) {
    return SKILL_ICONS.ai;
  }

  if (
    normalizedName.includes('design') ||
    normalizedName.includes('ui') ||
    normalizedName.includes('ux')
  ) {
    return SKILL_ICONS.design;
  }

  if (
    normalizedName.includes('aws') ||
    normalizedName.includes('cloud') ||
    normalizedName.includes('docker')
  ) {
    return SKILL_ICONS.devops;
  }

  if (normalizedName.includes('test') || normalizedName.includes('qa')) {
    return SKILL_ICONS.testing;
  }

  return fallbackIcon || SKILL_ICONS.default;
}

// Function to get skill color by name
export function getSkillColor(skillName: string): string {
  const normalizedName = skillName.toLowerCase().trim();

  // Color mappings for popular technologies
  const colorMap: Record<string, string> = {
    react: '#61DAFB',
    vue: '#4FC08D',
    angular: '#DD0031',
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    'node.js': '#339933',
    python: '#3776AB',
    java: '#ED8B00',
    'c#': '#239120',
    php: '#777BB4',
    css: '#1572B6',
    html: '#E34F26',
    mysql: '#4479A1',
    postgresql: '#336791',
    mongodb: '#47A248',
    aws: '#FF9900',
    docker: '#2496ED',
    git: '#F05032',
    figma: '#F24E1E',
    photoshop: '#31A8FF',
  };

  // Direct match
  if (colorMap[normalizedName]) {
    return colorMap[normalizedName];
  }

  // Partial match
  const partialMatch = Object.keys(colorMap).find(
    key => normalizedName.includes(key) || key.includes(normalizedName)
  );

  if (partialMatch) {
    return colorMap[partialMatch];
  }

  // Category-based colors
  if (
    normalizedName.includes('frontend') ||
    normalizedName.includes('css') ||
    normalizedName.includes('html')
  ) {
    return '#3B82F6'; // Blue
  }

  if (
    normalizedName.includes('backend') ||
    normalizedName.includes('server') ||
    normalizedName.includes('api')
  ) {
    return '#10B981'; // Green
  }

  if (normalizedName.includes('database') || normalizedName.includes('sql')) {
    return '#8B5CF6'; // Purple
  }

  if (
    normalizedName.includes('mobile') ||
    normalizedName.includes('ios') ||
    normalizedName.includes('android')
  ) {
    return '#F59E0B'; // Amber
  }

  if (normalizedName.includes('design') || normalizedName.includes('ui')) {
    return '#EC4899'; // Pink
  }

  if (normalizedName.includes('devops') || normalizedName.includes('cloud')) {
    return '#06B6D4'; // Cyan
  }

  return '#6B7280'; // Default gray
}

export default SKILL_ICONS;
