import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Play,
  Pause,
  ExternalLink,
  User,
  Building,
  Calendar,
  Heart,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Rating component
interface RatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  showNumber = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted-foreground'
          )}
        />
      ))}
      {showNumber && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
};

// Testimonial data interface
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating?: number;
  date?: string;
  projectType?: string;
  skills?: string[];
  verified?: boolean;
  featured?: boolean;
  linkedInUrl?: string;
  companyUrl?: string;
  tags?: string[];
}

// Carousel configuration
export interface CarouselConfig {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  centerMode?: boolean;
  adaptiveHeight?: boolean;
  transitionDuration?: number;
  swipeThreshold?: number;
}

// Main component props
export interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  config?: CarouselConfig;
  className?: string;
  cardVariant?: 'default' | 'minimal' | 'detailed' | 'compact';
  showFilters?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
  onShare?: (testimonial: Testimonial) => void;
  enableKeyboardNavigation?: boolean;
  enableSwipeGestures?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: CarouselConfig = {
  autoPlay: true,
  autoPlayInterval: 5000,
  showDots: true,
  showArrows: true,
  showProgress: false,
  pauseOnHover: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  centerMode: false,
  adaptiveHeight: false,
  transitionDuration: 500,
  swipeThreshold: 50,
};

// Individual testimonial card
interface TestimonialCardProps {
  testimonial: Testimonial;
  variant: 'default' | 'minimal' | 'detailed' | 'compact';
  isActive?: boolean;
  onClick?: () => void;
  onShare?: () => void;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  variant,
  isActive = false,
  onClick,
  onShare,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderAvatar = () => (
    <div className="relative">
      {testimonial.avatar && !imageError ? (
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-12 w-12 rounded-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {testimonial.verified && (
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-green-500">
          <Star className="h-2 w-2 fill-white text-white" />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="space-y-4 text-center">
            <Quote className="mx-auto h-8 w-8 text-primary opacity-50" />
            <blockquote className="font-sans text-lg italic leading-relaxed text-muted-foreground">
              "{testimonial.content}"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              {renderAvatar()}
              <div>
                <p className="font-heading text-lg font-semibold">
                  {testimonial.name}
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="flex gap-3">
            {renderAvatar()}
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-heading text-sm font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
                {testimonial.rating && (
                  <Rating rating={testimonial.rating} size="sm" />
                )}
              </div>
              <p className="line-clamp-3 font-sans text-sm leading-relaxed text-muted-foreground">
                "{testimonial.content}"
              </p>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {renderAvatar()}
                <div>
                  <h4 className="font-heading text-lg font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="font-sans text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="font-sans text-xs text-muted-foreground">
                      {testimonial.company}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {testimonial.rating && (
                  <Rating rating={testimonial.rating} size="sm" showNumber />
                )}
                {testimonial.date && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {testimonial.date}
                  </div>
                )}
              </div>
            </div>

            <blockquote className="relative italic text-muted-foreground">
              <Quote className="absolute -left-2 -top-2 h-6 w-6 text-primary/30" />
              <p className="relative z-10 font-sans text-lg leading-relaxed">
                {testimonial.content}
              </p>
            </blockquote>

            {(testimonial.projectType || testimonial.skills) && (
              <div className="space-y-3">
                {testimonial.projectType && (
                  <div>
                    <span className="font-sans text-xs font-medium text-muted-foreground">
                      Project:
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-2 font-sans text-xs"
                    >
                      {testimonial.projectType}
                    </Badge>
                  </div>
                )}

                {testimonial.skills && testimonial.skills.length > 0 && (
                  <div>
                    <span className="font-sans text-xs font-medium text-muted-foreground">
                      Skills:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {testimonial.skills.slice(0, 4).map(skill => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="font-sans text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {testimonial.skills.length > 4 && (
                        <Badge variant="outline" className="font-sans text-xs">
                          +{testimonial.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(testimonial.linkedInUrl || testimonial.companyUrl) && (
              <div className="flex gap-2 border-t border-border pt-4">
                {testimonial.linkedInUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-sans"
                  >
                    <a
                      href={testimonial.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {testimonial.companyUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-sans"
                  >
                    <a
                      href={testimonial.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Building className="mr-1 h-3 w-3" />
                      Company
                    </a>
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="font-sans"
                  >
                    <Share2 className="mr-1 h-3 w-3" />
                    Share
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      default: // "default"
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {renderAvatar()}
              <div className="flex-1">
                <h4 className="font-heading text-lg font-semibold">
                  {testimonial.name}
                </h4>
                <p className="font-sans text-sm text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
              {testimonial.rating && (
                <Rating rating={testimonial.rating} size="sm" />
              )}
            </div>

            <blockquote className="font-sans text-lg italic leading-relaxed text-muted-foreground">
              "{testimonial.content}"
            </blockquote>

            {testimonial.tags && testimonial.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {testimonial.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="font-sans text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card
      className={cn(
        'h-full cursor-pointer transition-all duration-300',
        isActive ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md',
        testimonial.featured && 'border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {testimonial.featured && (
          <Badge className="mb-4" variant="default">
            <Star className="mr-1 h-3 w-3" />
            Featured
          </Badge>
        )}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

// Main Testimonials Carousel component
export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  config = {},
  className,
  cardVariant = 'detailed',
  showFilters = false,
  onTestimonialClick,
  onShare,
  enableKeyboardNavigation = true,
  enableSwipeGestures = true,
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const prefersReducedMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(mergedConfig.autoPlay);
  const [filter, setFilter] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter testimonials
  const filteredTestimonials = filter
    ? testimonials.filter(
        t =>
          t.company.toLowerCase().includes(filter.toLowerCase()) ||
          t.role.toLowerCase().includes(filter.toLowerCase()) ||
          t.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      )
    : testimonials;

  const totalSlides = filteredTestimonials.length;

  // Navigation functions
  const goToSlide = useCallback(
    (index: number) => {
      if (mergedConfig.infinite) {
        setCurrentIndex((index + totalSlides) % totalSlides);
      } else {
        setCurrentIndex(Math.max(0, Math.min(index, totalSlides - 1)));
      }
    },
    [totalSlides, mergedConfig.infinite]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + (mergedConfig.slidesToScroll || 1));
  }, [currentIndex, goToSlide, mergedConfig.slidesToScroll]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - (mergedConfig.slidesToScroll || 1));
  }, [currentIndex, goToSlide, mergedConfig.slidesToScroll]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !prefersReducedMotion && totalSlides > 1) {
      intervalRef.current = setInterval(
        nextSlide,
        mergedConfig.autoPlayInterval
      );
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isPlaying,
    nextSlide,
    mergedConfig.autoPlayInterval,
    prefersReducedMotion,
    totalSlides,
  ]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, prevSlide, nextSlide, goToSlide, totalSlides]);

  // Touch/Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!enableSwipeGestures || !touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > (mergedConfig.swipeThreshold || 50);
    const isRightSwipe = distance < -(mergedConfig.swipeThreshold || 50);

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Pause on hover
  const handleMouseEnter = () => {
    if (mergedConfig.pauseOnHover) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (mergedConfig.pauseOnHover && mergedConfig.autoPlay) {
      setIsPlaying(true);
    }
  };

  // Get unique companies/roles for filter
  const filterOptions = Array.from(
    new Set([
      ...testimonials.map(t => t.company),
      ...testimonials.map(t => t.role),
      ...testimonials.flatMap(t => t.tags || []),
    ])
  ).sort();

  if (totalSlides === 0) {
    return (
      <div className="py-12 text-center">
        <Quote className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No testimonials available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {showFilters && filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(null)}
          >
            All
          </Button>
          {filterOptions.slice(0, 6).map(option => (
            <Button
              key={option}
              variant={filter === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      )}

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {mergedConfig.showArrows && totalSlides > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 shadow-lg"
              onClick={prevSlide}
              disabled={!mergedConfig.infinite && currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 shadow-lg"
              onClick={nextSlide}
              disabled={
                !mergedConfig.infinite && currentIndex >= totalSlides - 1
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Slides */}
        <div className="overflow-hidden rounded-lg">
          <div
            className={cn(
              'flex transition-transform duration-500 ease-out',
              prefersReducedMotion && 'transition-none'
            )}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {filteredTestimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                <TestimonialCard
                  testimonial={testimonial}
                  variant={cardVariant}
                  isActive={index === currentIndex}
                  onClick={() => onTestimonialClick?.(testimonial)}
                  onShare={() => onShare?.(testimonial)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {mergedConfig.showProgress && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-1 overflow-hidden rounded-full bg-background/50">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Dots Navigation */}
        {mergedConfig.showDots && totalSlides > 1 && (
          <div className="flex gap-2">
            {filteredTestimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'scale-125 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Play/Pause Control */}
        {mergedConfig.autoPlay && totalSlides > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {totalSlides}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
