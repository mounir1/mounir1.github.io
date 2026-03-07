import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Typing configuration interface
export interface TypingConfig {
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  cursorBlinkSpeed?: number;
  randomizeSpeed?: boolean;
  preserveWhitespace?: boolean;
}

// Animation variants
export interface AnimationVariant {
  name: 'typewriter' | 'fade' | 'slide' | 'scale' | 'glitch';
  duration?: number;
  easing?: string;
}

// Text styling interface
export interface TextStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  gradient?: {
    from: string;
    to: string;
    direction?:
      | 'to-r'
      | 'to-l'
      | 'to-t'
      | 'to-b'
      | 'to-br'
      | 'to-bl'
      | 'to-tr'
      | 'to-tl';
  };
}

// Individual text item interface
export interface TypingTextItem {
  text: string;
  style?: TextStyle;
  pauseAfter?: number;
  highlight?: boolean;
  animation?: AnimationVariant;
}

// Main component props
export interface DynamicTypingEffectProps {
  texts: (string | TypingTextItem)[];
  config?: TypingConfig;
  defaultStyle?: TextStyle;
  className?: string;
  onComplete?: () => void;
  onTextChange?: (text: string, index: number) => void;
  startDelay?: number;
  prefix?: string;
  suffix?: string;
  wrapperElement?: keyof JSX.IntrinsicElements;
  enableSound?: boolean;
  soundUrl?: string;
}

// Default configuration
const DEFAULT_CONFIG: TypingConfig = {
  typeSpeed: 100,
  deleteSpeed: 50,
  pauseDuration: 2000,
  loop: true,
  showCursor: true,
  cursorChar: '|',
  cursorBlinkSpeed: 1000,
  randomizeSpeed: false,
  preserveWhitespace: true,
};

// Typing state
interface TypingState {
  currentIndex: number;
  currentText: string;
  isDeleting: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number;
}

// Sound hook for typing effects
const useTypingSound = (enabled: boolean, soundUrl?: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled && soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = 0.1; // Low volume for subtle effect
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
    };
  }, [enabled, soundUrl]);

  const playSound = useCallback(() => {
    if (audioRef.current && enabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore errors (user might not have interacted with page yet)
      });
    }
  }, [enabled]);

  return playSound;
};

// Cursor component
interface CursorProps {
  show: boolean;
  char: string;
  blinkSpeed: number;
  className?: string;
}

const Cursor: React.FC<CursorProps> = ({
  show,
  char,
  blinkSpeed,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!show || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, blinkSpeed);

    return () => clearInterval(interval);
  }, [show, blinkSpeed, prefersReducedMotion]);

  if (!show) return null;

  return (
    <span
      className={cn(
        'inline-block',
        prefersReducedMotion
          ? 'opacity-100'
          : visible
            ? 'opacity-100'
            : 'opacity-0',
        'transition-opacity duration-75',
        className
      )}
    >
      {char}
    </span>
  );
};

// Text renderer with styles
interface StyledTextProps {
  text: string;
  style?: TextStyle;
  className?: string;
}

const StyledText: React.FC<StyledTextProps> = ({ text, style, className }) => {
  const textStyle: React.CSSProperties = {
    color: style?.color,
    fontSize: style?.fontSize,
    fontWeight: style?.fontWeight,
    fontFamily: style?.fontFamily,
  };

  // Handle gradient text
  if (style?.gradient) {
    const gradientClass = `bg-gradient-${style.gradient.direction || 'to-r'} from-${style.gradient.from} to-${style.gradient.to} bg-clip-text text-transparent`;

    return (
      <span className={cn(gradientClass, className)} style={textStyle}>
        {text}
      </span>
    );
  }

  return (
    <span className={className} style={textStyle}>
      {text}
    </span>
  );
};

// Main Dynamic Typing Effect component
export const DynamicTypingEffect: React.FC<DynamicTypingEffectProps> = ({
  texts,
  config = {},
  defaultStyle,
  className,
  onComplete,
  onTextChange,
  startDelay = 0,
  prefix = '',
  suffix = '',
  wrapperElement: WrapperElement = 'span',
  enableSound = false,
  soundUrl,
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const prefersReducedMotion = useReducedMotion();

  // State management
  const [state, setState] = useState<TypingState>({
    currentIndex: 0,
    currentText: '',
    isDeleting: false,
    isPaused: false,
    isComplete: false,
    speed: mergedConfig.typeSpeed || 100,
  });

  const [hasStarted, setHasStarted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const playSound = useTypingSound(enableSound, soundUrl);

  // Convert texts to TypingTextItem format
  const normalizedTexts: TypingTextItem[] = texts.map(text =>
    typeof text === 'string'
      ? { text, style: defaultStyle }
      : { ...text, style: { ...defaultStyle, ...text.style } }
  );

  // Get current text item
  const currentItem = normalizedTexts[state.currentIndex] || normalizedTexts[0];
  const targetText = currentItem?.text || '';

  // Start delay effect
  useEffect(() => {
    if (startDelay > 0) {
      const timer = setTimeout(() => setHasStarted(true), startDelay);
      return () => clearTimeout(timer);
    } else {
      setHasStarted(true);
    }
  }, [startDelay]);

  // Main typing logic
  const typeStep = useCallback(() => {
    if (!hasStarted || prefersReducedMotion) {
      // Skip animation if reduced motion is preferred
      setState(prev => ({
        ...prev,
        currentText: targetText,
        isComplete: !mergedConfig.loop,
      }));
      onTextChange?.(targetText, state.currentIndex);
      return;
    }

    setState(prevState => {
      const { currentText, isDeleting, isPaused, currentIndex } = prevState;

      if (isPaused) {
        // End pause
        return { ...prevState, isPaused: false };
      }

      if (!isDeleting) {
        // Typing forward
        if (currentText.length < targetText.length) {
          const nextChar = targetText[currentText.length];
          const newText = currentText + nextChar;

          // Play sound on each character
          if (enableSound) {
            playSound();
          }

          return {
            ...prevState,
            currentText: newText,
            speed: mergedConfig.randomizeSpeed
              ? (mergedConfig.typeSpeed || 100) + Math.random() * 50 - 25
              : mergedConfig.typeSpeed || 100,
          };
        } else {
          // Finished typing current text
          onTextChange?.(currentText, currentIndex);

          const pauseDuration =
            currentItem.pauseAfter || mergedConfig.pauseDuration || 2000;

          return {
            ...prevState,
            isPaused: true,
            speed: pauseDuration,
          };
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          const newText = currentText.slice(0, -1);
          return {
            ...prevState,
            currentText: newText,
            speed: mergedConfig.deleteSpeed || 50,
          };
        } else {
          // Finished deleting, move to next text
          const nextIndex = (currentIndex + 1) % normalizedTexts.length;
          const isComplete = !mergedConfig.loop && nextIndex === 0;

          if (isComplete) {
            onComplete?.();
          }

          return {
            ...prevState,
            currentIndex: nextIndex,
            isDeleting: false,
            isComplete,
            speed: mergedConfig.typeSpeed || 100,
          };
        }
      }
    });
  }, [
    hasStarted,
    targetText,
    currentItem,
    mergedConfig,
    onTextChange,
    onComplete,
    state.currentIndex,
    enableSound,
    playSound,
    prefersReducedMotion,
  ]);

  // Handle pause completion and start deleting
  useEffect(() => {
    if (
      state.isPaused &&
      state.currentText === targetText &&
      !state.isDeleting
    ) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isPaused: false,
          isDeleting: true,
          speed: mergedConfig.deleteSpeed || 50,
        }));
      }, state.speed);

      return () => clearTimeout(timer);
    }
  }, [
    state.isPaused,
    state.currentText,
    targetText,
    state.isDeleting,
    state.speed,
    mergedConfig.deleteSpeed,
  ]);

  // Main animation loop
  useEffect(() => {
    if (state.isComplete && !mergedConfig.loop) return;

    timeoutRef.current = setTimeout(typeStep, state.speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [typeStep, state.speed, state.isComplete, mergedConfig.loop]);

  // Animation variants
  const getAnimationClasses = (animation?: AnimationVariant) => {
    if (!animation || prefersReducedMotion) return '';

    switch (animation.name) {
      case 'fade':
        return 'animate-in fade-in duration-500';
      case 'slide':
        return 'animate-in slide-in-from-left-2 duration-300';
      case 'scale':
        return 'animate-in zoom-in duration-200';
      case 'glitch':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  // Render the typing effect
  const displayText = prefersReducedMotion ? targetText : state.currentText;
  const showCursor = mergedConfig.showCursor && !state.isComplete;
  const animationClasses = getAnimationClasses(currentItem?.animation);

  return (
    <WrapperElement
      className={cn(
        'inline-block',
        animationClasses,
        currentItem?.highlight && 'rounded bg-primary/10 px-2 py-1',
        className
      )}
    >
      {prefix && <span className="text-muted-foreground">{prefix}</span>}

      <StyledText
        text={displayText}
        style={currentItem?.style}
        className="font-medium"
      />

      <Cursor
        show={showCursor}
        char={mergedConfig.cursorChar || '|'}
        blinkSpeed={mergedConfig.cursorBlinkSpeed || 1000}
        className="text-primary"
      />

      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </WrapperElement>
  );
};

// Pre-configured typing presets
export const TypingPresets = {
  // Professional roles
  professional: {
    typeSpeed: 80,
    deleteSpeed: 40,
    pauseDuration: 3000,
    loop: true,
    showCursor: true,
    cursorChar: '|',
    randomizeSpeed: true,
  },

  // Fast and energetic
  energetic: {
    typeSpeed: 50,
    deleteSpeed: 30,
    pauseDuration: 1500,
    loop: true,
    showCursor: true,
    cursorChar: '_',
    randomizeSpeed: false,
  },

  // Slow and deliberate
  deliberate: {
    typeSpeed: 150,
    deleteSpeed: 75,
    pauseDuration: 4000,
    loop: true,
    showCursor: true,
    cursorChar: '█',
    randomizeSpeed: false,
  },

  // Terminal style
  terminal: {
    typeSpeed: 60,
    deleteSpeed: 20,
    pauseDuration: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '▋',
    cursorBlinkSpeed: 500,
    randomizeSpeed: true,
  },
};

// Text style presets
export const TextStylePresets = {
  gradient: {
    gradient: {
      from: 'blue-600',
      to: 'purple-600',
      direction: 'to-r' as const,
    },
  },

  primary: {
    color: 'rgb(var(--primary))',
  },

  accent: {
    gradient: {
      from: 'pink-500',
      to: 'orange-500',
      direction: 'to-r' as const,
    },
  },

  success: {
    color: 'rgb(34, 197, 94)',
  },
};

export default DynamicTypingEffect;
