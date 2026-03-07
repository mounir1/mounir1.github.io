import React from 'react';
import { cn } from '@/lib/utils';

export const Footer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <footer
      className={cn('w-full border-t bg-background', className)}
      {...props}
    >
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <img
            src="/mounir-signature.svg"
            alt="Mounir's Signature"
            className="h-12 w-auto dark:invert"
          />
        </div>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          Built with passion by{' '}
          <a
            href="https://github.com/mounirtms"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Mounir
          </a>
          . The source code is available on{' '}
          <a
            href="https://github.com/mounirtms/mounir1.github.io"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
