import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Image format detection and optimization
const SUPPORTED_FORMATS = {
  webp: { mime: 'image/webp', quality: 0.8, compression: 'high' },
  avif: { mime: 'image/avif', quality: 0.7, compression: 'highest' },
  jpeg: { mime: 'image/jpeg', quality: 0.85, compression: 'medium' },
  png: { mime: 'image/png', quality: 1, compression: 'low' },
  svg: { mime: 'image/svg+xml', quality: 1, compression: 'none' },
};

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: { width: 480, label: 'Mobile' },
  tablet: { width: 768, label: 'Tablet' },
  desktop: { width: 1200, label: 'Desktop' },
  large: { width: 1920, label: 'Large' },
};

// Image loading priorities
type LoadingPriority = 'high' | 'medium' | 'low' | 'auto';

// Image optimization settings
interface ImageOptimization {
  format?: keyof typeof SUPPORTED_FORMATS;
  quality?: number;
  progressive?: boolean;
  blur?: boolean;
  sharpen?: boolean;
}

// Responsive image configuration
interface ResponsiveConfig {
  sizes: string;
  breakpoints: Array<{
    media: string;
    width: number;
    height?: number;
  }>;
}

// Loading states
interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  loadTime?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  format?: string;
  size?: number;
}

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (threshold = 0.1, rootMargin = '50px') => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return { ref: setRef, isVisible };
};

// Image format detection
const detectOptimalFormat = async (): Promise<
  keyof typeof SUPPORTED_FORMATS
> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (!ctx) return 'jpeg';

  // Test WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  // Test AVIF support
  try {
    const avifTest = canvas.toDataURL('image/avif');
    if (avifTest.indexOf('data:image/avif') === 0) {
      return 'avif';
    }
  } catch {
    // AVIF not supported
  }

  return 'jpeg';
};

// Generate responsive image sources
const generateResponsiveSources = (
  src: string,
  optimization: ImageOptimization,
  responsive?: ResponsiveConfig
) => {
  if (!responsive) return [];

  return responsive.breakpoints.map(bp => {
    const params = new URLSearchParams({
      w: bp.width.toString(),
      h: bp.height?.toString() || 'auto',
      q: (optimization.quality || 0.8).toString(),
      f: optimization.format || 'auto',
    });

    return {
      media: bp.media,
      srcset: `${src}?${params.toString()}`,
      width: bp.width,
      height: bp.height,
    };
  });
};

// Main OptimizedImage component
export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'video' | string;
  lazy?: boolean;
  priority?: LoadingPriority;
  placeholder?: 'blur' | 'empty' | string;
  optimization?: ImageOptimization;
  responsive?: ResponsiveConfig;
  fallback?: string[];
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoadStart?: () => void;
  showMetadata?: boolean;
  enableFullscreen?: boolean;
  draggable?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  aspectRatio,
  lazy = true,
  priority = 'auto',
  placeholder = 'blur',
  optimization = {},
  responsive,
  fallback = [],
  onLoad,
  onError,
  onLoadStart,
  showMetadata = false,
  enableFullscreen = false,
  draggable = false,
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
  });

  const [optimalFormat, setOptimalFormat] =
    useState<keyof typeof SUPPORTED_FORMATS>('jpeg');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { ref: intersectionRef, isVisible } = useIntersectionObserver();

  const shouldLoad = !lazy || isVisible || priority === 'high';

  // Detect optimal format on mount
  useEffect(() => {
    detectOptimalFormat().then(setOptimalFormat);
  }, []);

  // Generate optimized source URL
  const generateOptimizedSrc = useCallback(
    (baseSrc: string) => {
      const opt = { format: optimalFormat, quality: 0.8, ...optimization };
      const params = new URLSearchParams();

      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (opt.quality) params.set('q', opt.quality.toString());
      if (opt.format) params.set('f', opt.format);
      if (opt.progressive) params.set('progressive', 'true');

      return `${baseSrc}?${params.toString()}`;
    },
    [optimalFormat, optimization, width, height]
  );

  // Handle image loading
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const loadTime = performance.now();

    setImageState(prev => ({
      ...prev,
      isLoading: false,
      isLoaded: true,
      hasError: false,
      loadTime,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));

    onLoad?.(event);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState(prev => ({
      ...prev,
      isLoading: false,
      isLoaded: false,
      hasError: true,
    }));

    // Try fallback images
    if (fallback.length > 0) {
      const nextFallback = fallback[0];
      setCurrentSrc(generateOptimizedSrc(nextFallback));
      // Remove used fallback for next retry
      fallback.shift();
    }

    onError?.(event);
  };

  const handleLoadStart = () => {
    setImageState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));
    onLoadStart?.();
  };

  // Update source when conditions change
  useEffect(() => {
    if (shouldLoad && !currentSrc) {
      setCurrentSrc(generateOptimizedSrc(src));
    }
  }, [shouldLoad, src, generateOptimizedSrc, currentSrc]);

  // Generate responsive sources
  const responsiveSources = responsive
    ? generateResponsiveSources(
        src,
        { format: optimalFormat, ...optimization },
        responsive
      )
    : [];

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    video: 'aspect-video',
  };

  const aspectRatioClass =
    typeof aspectRatio === 'string' && aspectRatio in aspectRatioClasses
      ? aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses]
      : aspectRatio;

  // Placeholder content
  const renderPlaceholder = () => {
    if (placeholder === 'empty') return null;

    if (placeholder === 'blur') {
      return (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200',
            aspectRatioClass
          )}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iIzAwMDAwMDEwIi8+Cjwvc3ZnPgo=')] opacity-20" />
        </div>
      );
    }

    // Custom placeholder URL
    return (
      <img
        src={placeholder}
        alt="Loading..."
        className="absolute inset-0 h-full w-full object-cover blur-sm"
        draggable={false}
      />
    );
  };

  // Loading state
  if (!shouldLoad) {
    return (
      <div
        ref={intersectionRef as any}
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-muted',
          aspectRatioClass,
          className
        )}
        style={{ width, height }}
      >
        <div className="space-y-2 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Image ready to load</p>
          {showMetadata && (
            <Badge variant="outline" className="text-xs">
              Priority: {priority}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (imageState.hasError) {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="space-y-4 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <div>
            <p className="text-sm text-red-600">Failed to load image</p>
            <p className="mt-1 text-xs text-red-500">{alt}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImageState(prev => ({ ...prev, hasError: false }));
              setCurrentSrc(generateOptimizedSrc(src));
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={intersectionRef as any}
      className={cn('group relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Main image */}
      <picture>
        {responsiveSources.map((source, index) => (
          <source
            key={index}
            media={source.media}
            srcSet={source.srcset}
            width={source.width}
            height={source.height}
          />
        ))}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding={priority === 'high' ? 'sync' : 'async'}
          draggable={draggable}
          className={cn(
            'h-full w-full object-cover transition-all duration-500',
            aspectRatioClass,
            imageState.isLoaded ? 'opacity-100' : 'opacity-0',
            enableFullscreen && 'cursor-zoom-in'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleLoadStart}
          onClick={enableFullscreen ? () => setIsFullscreen(true) : undefined}
        />
      </picture>

      {/* Placeholder */}
      {!imageState.isLoaded && renderPlaceholder()}

      {/* Loading indicator */}
      {imageState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <p className="text-xs text-white">Loading image...</p>
          </div>
        </div>
      )}

      {/* Metadata overlay */}
      {showMetadata && imageState.isLoaded && (
        <div className="absolute left-2 top-2 space-y-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Badge variant="secondary" className="bg-black/70 text-xs text-white">
            {imageState.naturalWidth}×{imageState.naturalHeight}
          </Badge>
          {imageState.loadTime && (
            <Badge
              variant="secondary"
              className="bg-black/70 text-xs text-white"
            >
              {imageState.loadTime.toFixed(0)}ms
            </Badge>
          )}
          <Badge variant="secondary" className="bg-black/70 text-xs text-white">
            {optimalFormat.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Fullscreen controls */}
      {enableFullscreen && imageState.isLoaded && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="bg-black/70 text-white hover:bg-black/80"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={currentSrc}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Image gallery component with responsive optimization
export interface OptimizedImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  aspectRatio?: string;
  lazy?: boolean;
  showMetadata?: boolean;
  className?: string;
}

export const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({
  images,
  layout = 'grid',
  columns = 3,
  aspectRatio = 'landscape',
  lazy = true,
  showMetadata = false,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const layoutClasses = {
    grid: `grid grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns} gap-4`,
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4',
    carousel: 'flex gap-4 overflow-x-auto',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Gallery */}
      <div className={layoutClasses[layout]}>
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              'group cursor-pointer',
              layout === 'masonry' && 'break-inside-avoid'
            )}
            onClick={() => setSelectedImage(index)}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              aspectRatio={aspectRatio}
              lazy={lazy}
              priority={index < 4 ? 'high' : 'medium'}
              showMetadata={showMetadata}
              enableFullscreen={false}
              className="w-full rounded-lg transition-all duration-300 hover:shadow-lg"
              responsive={{
                sizes:
                  '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
                breakpoints: [
                  { media: '(max-width: 768px)', width: 768 },
                  { media: '(max-width: 1200px)', width: 600 },
                  { media: '(min-width: 1201px)', width: 400 },
                ],
              }}
            />
            {(image.title || image.description) && (
              <div className="mt-2 space-y-1">
                {image.title && (
                  <h3 className="text-sm font-medium">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-xs text-muted-foreground">
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full">
            <OptimizedImage
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="max-h-full max-w-full"
              lazy={false}
              priority="high"
              enableFullscreen={false}
            />

            {/* Navigation */}
            <div className="absolute left-4 right-4 top-4 flex justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedImage(
                    selectedImage > 0 ? selectedImage - 1 : images.length - 1
                  );
                }}
                disabled={images.length <= 1}
              >
                ← Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedImage(
                    selectedImage < images.length - 1 ? selectedImage + 1 : 0
                  );
                }}
                disabled={images.length <= 1}
              >
                Next →
              </Button>
            </div>

            {/* Image info */}
            {(images[selectedImage].title ||
              images[selectedImage].description) && (
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/70 p-4 text-white">
                {images[selectedImage].title && (
                  <h3 className="font-medium">{images[selectedImage].title}</h3>
                )}
                {images[selectedImage].description && (
                  <p className="mt-1 text-sm opacity-90">
                    {images[selectedImage].description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export component interfaces
export interface OptimizedImageInterface {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'video' | string;
  lazy?: boolean;
  priority?: LoadingPriority;
  placeholder?: 'blur' | 'empty' | string;
  optimization?: ImageOptimization;
  responsive?: ResponsiveConfig;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default OptimizedImage;
