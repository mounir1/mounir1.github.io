/**
 * Modern Image Optimization Component
 * Implements next-generation image formats, lazy loading, and blur-up effects
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  formats?: ('avif' | 'webp' | 'jpg' | 'png')[];
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate srcSet for different formats and sizes
const generateSrcSet = (
  src: string,
  format: string,
  sizes: number[] = [640, 768, 1024, 1280, 1920]
) => {
  return sizes
    .map(size => {
      const extension = format === 'jpg' ? 'jpeg' : format;
      const optimizedSrc = src.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        `_${size}w.${extension}`
      );
      return `${optimizedSrc} ${size}w`;
    })
    .join(', ');
};

// Create blur placeholder
const createBlurPlaceholder = (width: number = 40, height: number = 40) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Create a simple gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(0.5, '#e5e7eb');
    gradient.addColorStop(1, '#d1d5db');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.1);
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  formats = ['avif', 'webp', 'jpg'],
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<string | null>(null);

  // Generate blur placeholder if not provided
  if (!placeholderRef.current && placeholder === 'blur' && !blurDataURL) {
    placeholderRef.current = createBlurPlaceholder(width, height);
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const shouldShowPlaceholder =
    placeholder !== 'empty' && !isLoaded && !hasError;
  const placeholderSrc = blurDataURL || placeholderRef.current;

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
      {...props}
    >
      {/* Placeholder */}
      {shouldShowPlaceholder && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Main image */}
      {(isInView || priority) && !hasError && (
        <picture>
          {formats.map(format => (
            <source
              key={format}
              srcSet={generateSrcSet(src, format)}
              sizes={sizes}
              type={`image/${format}`}
            />
          ))}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

// Progressive image component with multiple quality levels
export interface ProgressiveImageProps extends OptimizedImageProps {
  lowQualitySrc?: string;
  mediumQualitySrc?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  mediumQualitySrc,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sources = [lowQualitySrc, mediumQualitySrc, src].filter(
      Boolean
    ) as string[];

    sources.forEach((source, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedSources(prev => new Set([...prev, source]));

        // Update current source to the highest quality available
        if (index === sources.length - 1) {
          setCurrentSrc(source); // Final high-quality image
        } else if (index === 1 && !loadedSources.has(sources[2])) {
          setCurrentSrc(source); // Medium quality while waiting for high quality
        }
      };
      img.src = source;
    });
  }, [src, lowQualitySrc, mediumQualitySrc, loadedSources]);

  return <OptimizedImage {...props} src={currentSrc} />;
};

// Image with automatic format detection
export const SmartImage: React.FC<OptimizedImageProps> = props => {
  const [supportedFormats, setSupportedFormats] = useState<string[]>(['jpg']);

  useEffect(() => {
    const checkFormatSupport = async () => {
      const formats: string[] = ['jpg'];

      // Check WebP support
      const webpCanvas = document.createElement('canvas');
      webpCanvas.width = 1;
      webpCanvas.height = 1;
      const webpSupported =
        webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      if (webpSupported) formats.unshift('webp');

      // Check AVIF support
      try {
        const avifSupported = await new Promise<boolean>(resolve => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src =
            'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
        if (avifSupported) formats.unshift('avif');
      } catch {
        // AVIF not supported
      }

      setSupportedFormats(formats);
    };

    checkFormatSupport();
  }, []);

  return <OptimizedImage {...props} formats={supportedFormats as any} />;
};
