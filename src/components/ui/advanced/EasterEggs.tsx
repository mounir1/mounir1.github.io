/**
 * Easter Eggs Component
 * Hidden interactive elements that showcase developer personality
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Konami Code Easter Egg
export const KonamiCode: React.FC<{
  onActivate: () => void;
  children?: React.ReactNode;
}> = ({ onActivate, children }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setSequence(prev => {
        const newSequence = [...prev, event.code].slice(-konamiCode.length);

        if (
          newSequence.length === konamiCode.length &&
          newSequence.every((key, index) => key === konamiCode[index])
        ) {
          onActivate();
          return [];
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate, konamiCode]);

  return <>{children}</>;
};

// Click Counter Easter Egg
export const ClickCounter: React.FC<{
  target: number;
  onReach: () => void;
  resetAfter?: number;
  children: React.ReactNode;
}> = ({ target, onReach, resetAfter = 5000, children }) => {
  const [clicks, setClicks] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = () => {
    setClicks(prev => {
      const newCount = prev + 1;

      if (newCount === target) {
        onReach();
        return 0;
      }

      // Reset counter after inactivity
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setClicks(0);
      }, resetAfter);

      return newCount;
    });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

// Secret Message Easter Egg
export const SecretMessage: React.FC<{
  trigger: string;
  message: string;
  duration?: number;
}> = ({ trigger, message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [inputSequence, setInputSequence] = useState('');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      setInputSequence(prev => {
        const newSequence = (prev + event.key).slice(-trigger.length);

        if (newSequence.toLowerCase() === trigger.toLowerCase()) {
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), duration);
          return '';
        }

        return newSequence;
      });
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [trigger, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-4 z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg animate-in slide-in-from-right">
      {message}
    </div>
  );
};

// Matrix Rain Easter Egg
export const MatrixRain: React.FC<{
  isActive: boolean;
  duration?: number;
}> = ({ isActive, duration = 10000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }, duration);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timer);
    };
  }, [isActive, duration]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    />
  );
};

// Floating Cat Easter Egg
export const FloatingCat: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + direction.x * 0.5;
        let newY = prev.y + direction.y * 0.3;

        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        if (newX <= 0 || newX >= 95) {
          newDirectionX = -direction.x;
          newX = Math.max(0, Math.min(95, newX));
        }

        if (newY <= 0 || newY >= 90) {
          newDirectionY = -direction.y;
          newY = Math.max(0, Math.min(90, newY));
        }

        setDirection({ x: newDirectionX, y: newDirectionY });
        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, direction]);

  if (!isActive) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 animate-bounce text-4xl"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      🐱
    </div>
  );
};

// Developer Console Messages
export const ConsoleMessages: React.FC = () => {
  useEffect(() => {
    const messages = [
      {
        text: '🎉 Hey there, fellow developer!',
        style: 'color: #ff6b6b; font-size: 16px; font-weight: bold;',
      },
      {
        text: '👋 Thanks for checking out the console!',
        style: 'color: #4ecdc4; font-size: 14px;',
      },
      {
        text: '🚀 This portfolio was built with React, TypeScript, and lots of ☕',
        style: 'color: #45b7d1; font-size: 14px;',
      },
      {
        text: "💼 Interested in working together? Let's connect!",
        style: 'color: #96ceb4; font-size: 14px;',
      },
      {
        text: '🎨 Try the Konami code for a surprise: ↑↑↓↓←→←→BA',
        style: 'color: #feca57; font-size: 12px; font-style: italic;',
      },
    ];

    messages.forEach((message, index) => {
      setTimeout(() => {
        console.log(`%c${message.text}`, message.style);
      }, index * 1000);
    });

    // ASCII Art
    setTimeout(
      () => {
        console.log(
          `%c
    ╔══════════════════════════════════════╗
    ║           DEVELOPER MODE             ║
    ║                                      ║
    ║  You found the secret developer      ║
    ║  console! Here's a virtual cookie    ║
    ║  for your curiosity: 🍪              ║
    ║                                      ║
    ║  Keep exploring and happy coding!    ║
    ╚══════════════════════════════════════╝
      `,
          'color: #ff9ff3; font-family: monospace;'
        );
      },
      messages.length * 1000 + 500
    );
  }, []);

  return null;
};

// Main Easter Eggs Container
export const EasterEggs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [matrixActive, setMatrixActive] = useState(false);
  const [catActive, setCatActive] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const activateMatrix = () => {
    setMatrixActive(true);
    setTimeout(() => setMatrixActive(false), 10000);
  };

  const activateCat = () => {
    setCatActive(true);
    setTimeout(() => setCatActive(false), 15000);
  };

  const showSecretMessage = () => {
    setShowSecret(true);
    setTimeout(() => setShowSecret(false), 5000);
  };

  return (
    <>
      <ConsoleMessages />

      <KonamiCode onActivate={activateMatrix}>
        <ClickCounter target={10} onReach={activateCat}>
          <SecretMessage
            trigger="developer"
            message="🎉 You found the secret! You're clearly a developer at heart!"
          />
          {children}
        </ClickCounter>
      </KonamiCode>

      <MatrixRain isActive={matrixActive} />
      <FloatingCat isActive={catActive} />

      {showSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-lg bg-card p-8 text-center shadow-xl animate-in zoom-in-95">
            <h2 className="mb-4 text-2xl font-bold">🎊 Congratulations!</h2>
            <p className="mb-4 text-muted-foreground">
              You've discovered one of the hidden easter eggs!
            </p>
            <p className="text-sm text-muted-foreground">
              There are more secrets hidden throughout the site...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for managing easter eggs
export const useEasterEggs = () => {
  const [discoveredEggs, setDiscoveredEggs] = useState<string[]>([]);

  const discoverEgg = (eggId: string) => {
    setDiscoveredEggs(prev => (prev.includes(eggId) ? prev : [...prev, eggId]));
  };

  const resetEggs = () => {
    setDiscoveredEggs([]);
  };

  return {
    discoveredEggs,
    discoverEgg,
    resetEggs,
    totalDiscovered: discoveredEggs.length,
  };
};
