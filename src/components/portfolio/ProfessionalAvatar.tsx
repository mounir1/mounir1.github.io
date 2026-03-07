import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Edit3,
  Download,
  Share2,
  User,
  MapPin,
  Calendar,
  Award,
  Star,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Avatar configuration interface
export interface AvatarConfig {
  src: string;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'rounded' | 'square';
  borderStyle?: 'none' | 'simple' | 'gradient' | 'glow' | 'animated';
  hoverEffect?: 'scale' | 'glow' | 'tilt' | 'flip' | 'float' | 'pulse' | 'none';
}

// Professional avatar props
export interface ProfessionalAvatarProps {
  avatar: AvatarConfig;
  name: string;
  title: string;
  subtitle?: string;
  location?: string;
  joinDate?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: React.ReactNode;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  }>;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
  layout?: 'card' | 'profile' | 'compact';
  enableAnimations?: boolean;
  showBackground?: boolean;
  backgroundGradient?: string;
}

// Size configurations
const SIZE_CONFIG = {
  sm: {
    avatar: 'w-16 h-16',
    container: 'p-4',
    text: 'text-sm',
    title: 'text-base',
  },
  md: {
    avatar: 'w-24 h-24',
    container: 'p-6',
    text: 'text-sm',
    title: 'text-lg',
  },
  lg: {
    avatar: 'w-32 h-32',
    container: 'p-8',
    text: 'text-base',
    title: 'text-xl',
  },
  xl: {
    avatar: 'w-40 h-40',
    container: 'p-10',
    text: 'text-base',
    title: 'text-2xl',
  },
  '2xl': {
    avatar: 'w-48 h-48',
    container: 'p-12',
    text: 'text-lg',
    title: 'text-3xl',
  },
};

// Shape configurations
const SHAPE_CONFIG = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
  square: 'rounded-lg',
};

// Border style configurations
const BORDER_STYLES = {
  none: '',
  simple: 'ring-2 ring-border',
  gradient:
    'ring-2 ring-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1',
  glow: 'ring-4 ring-primary/30 shadow-lg shadow-primary/25',
  animated: 'ring-2 ring-primary animate-pulse',
};

// Hover effect configurations
const HOVER_EFFECTS = {
  scale: 'hover:scale-110 transition-transform duration-300',
  glow: 'hover:shadow-2xl hover:shadow-primary/50 transition-shadow duration-300',
  tilt: 'hover:rotate-3 transition-transform duration-300',
  flip: 'hover:scale-y-[-1] transition-transform duration-500',
  float: 'hover:-translate-y-2 transition-transform duration-300',
  pulse: 'hover:animate-pulse',
  none: '',
};

// Avatar image component
interface AvatarImageProps {
  config: AvatarConfig;
  className?: string;
}

const AvatarImage: React.FC<AvatarImageProps> = ({ config, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const sizeClass = SIZE_CONFIG[config.size || 'lg'].avatar;
  const shapeClass = SHAPE_CONFIG[config.shape || 'circle'];
  const borderClass = BORDER_STYLES[config.borderStyle || 'glow'];
  const hoverClass = prefersReducedMotion
    ? ''
    : HOVER_EFFECTS[config.hoverEffect || 'scale'];

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Fallback content
  const fallbackContent = config.fallbackText ? (
    <span className="text-2xl font-bold text-primary">
      {config.fallbackText}
    </span>
  ) : (
    <User className="h-1/2 w-1/2 text-muted-foreground" />
  );

  return (
    <div className={cn('relative', className)}>
      {/* Avatar container with border styles */}
      <div
        className={cn(
          'relative overflow-hidden',
          sizeClass,
          shapeClass,
          borderClass,
          hoverClass,
          'bg-gradient-to-br from-muted to-muted/50'
        )}
      >
        {/* Background gradient for gradient border */}
        {config.borderStyle === 'gradient' && (
          <div
            className={cn(
              'absolute inset-1 overflow-hidden bg-background',
              shapeClass
            )}
          >
            {!imageError && config.src ? (
              <img
                src={config.src}
                alt={config.alt}
                className="h-full w-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {fallbackContent}
              </div>
            )}
          </div>
        )}

        {/* Regular avatar content */}
        {config.borderStyle !== 'gradient' && (
          <>
            {!imageError && config.src ? (
              <img
                src={config.src}
                alt={config.alt}
                className={cn(
                  'h-full w-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : null}

            {(imageError || !config.src || !imageLoaded) && (
              <div className="absolute inset-0 flex items-center justify-center">
                {fallbackContent}
              </div>
            )}
          </>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && config.src && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>
    </div>
  );
};

// Main Professional Avatar component
export const ProfessionalAvatar: React.FC<ProfessionalAvatarProps> = ({
  avatar,
  name,
  title,
  subtitle,
  location,
  joinDate,
  badges = [],
  stats = [],
  actions = [],
  showOnlineStatus = false,
  isOnline = false,
  className,
  layout = 'card',
  enableAnimations = true,
  showBackground = true,
  backgroundGradient = 'from-blue-50 via-purple-50 to-pink-50',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = SIZE_CONFIG[avatar.size || 'lg'];

  // Mouse tracking for tilt effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableAnimations || prefersReducedMotion || !containerRef.current)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  // Parallax transform
  const transform =
    enableAnimations && !prefersReducedMotion && isHovered
      ? `perspective(1000px) rotateY(${(mousePosition.x - 0.5) * 10}deg) rotateX(${(mousePosition.y - 0.5) * -10}deg) translateZ(20px)`
      : 'none';

  // Layout variants
  const renderCardLayout = () => (
    <Card
      ref={containerRef}
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        'hover:shadow-2xl hover:shadow-primary/10',
        enableAnimations && 'transform-gpu',
        className
      )}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background */}
      {showBackground && (
        <div
          className={cn(
            'absolute inset-0 opacity-50',
            `bg-gradient-to-br ${backgroundGradient}`
          )}
        />
      )}

      <div className={cn('relative', sizeConfig.container)}>
        <div className="space-y-6 text-center">
          {/* Avatar with online status */}
          <div className="relative inline-block">
            <AvatarImage config={avatar} />

            {/* Online status indicator */}
            {showOnlineStatus && (
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background',
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}
              >
                <div
                  className={cn(
                    'h-full w-full rounded-full',
                    isOnline &&
                      enableAnimations &&
                      'animate-ping bg-green-400 opacity-75'
                  )}
                />
              </div>
            )}
          </div>

          {/* Name and title */}
          <div className="space-y-2">
            <h2 className={cn('font-bold text-foreground', sizeConfig.title)}>
              {name}
            </h2>
            <p className={cn('font-medium text-primary', sizeConfig.text)}>
              {title}
            </p>
            {subtitle && (
              <p className={cn('text-muted-foreground', sizeConfig.text)}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Location and join date */}
          {(location || joinDate) && (
            <div
              className={cn(
                'flex items-center justify-center gap-4 text-muted-foreground',
                sizeConfig.text
              )}
            >
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
              {joinDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{joinDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className="gap-1"
                >
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 border-t border-border/50 py-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-1">
                    {stat.icon}
                    <span className="font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <span
                    className={cn('text-muted-foreground', sizeConfig.text)}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 border-t border-border/50 pt-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderProfileLayout = () => (
    <div
      ref={containerRef}
      className={cn(
        'flex items-center gap-6 rounded-2xl p-6 transition-all duration-500',
        showBackground && `bg-gradient-to-r ${backgroundGradient}`,
        enableAnimations && 'transform-gpu hover:shadow-xl',
        className
      )}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <AvatarImage config={avatar} />

        {showOnlineStatus && (
          <div
            className={cn(
              'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background',
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <p className="font-medium text-primary">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant || 'secondary'}
                className="gap-1"
              >
                {badge.icon}
                {badge.label}
              </Badge>
            ))}
            {badges.length > 3 && (
              <Badge variant="outline">+{badges.length - 3} more</Badge>
            )}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          {stats.length > 0 && (
            <div className="flex gap-4">
              {stats.slice(0, 3).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center gap-1">
                    {stat.icon}
                    <span className="font-bold">{stat.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div
      ref={containerRef}
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 transition-all duration-300',
        enableAnimations && 'hover:bg-muted/50',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <AvatarImage config={{ ...avatar, size: 'sm' }} />

        {showOnlineStatus && (
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-background',
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-foreground">{name}</h4>
        <p className="truncate text-sm text-muted-foreground">{title}</p>
      </div>

      {actions.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={actions[0]?.onClick}
          className="flex-shrink-0"
        >
          {actions[0]?.icon || <User className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );

  // Render based on layout
  switch (layout) {
    case 'profile':
      return renderProfileLayout();
    case 'compact':
      return renderCompactLayout();
    default:
      return renderCardLayout();
  }
};

export default ProfessionalAvatar;
