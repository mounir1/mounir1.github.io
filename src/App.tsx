import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ErrorBoundary } from '@/components/shared/SimpleErrorBoundary';
import { Toaster } from '@/components/ui/sonner';

// Lazy-load all pages for code-splitting
const Index = lazy(() => import('./pages/Index'));
const Admin = lazy(() => import('./pages/Admin'));
const Blog  = lazy(() => import('./pages/Blog'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      <p className="text-sm font-medium text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: (count, err: unknown) => {
        const e = err as { code?: string };
        return !e?.code?.startsWith('auth/') && count < 2;
      },
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="system"
        storageKey="mounir-portfolio-theme"
        enableSystem
        disableTransitionOnChange={false}
        enableColorSchemeChange
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"       element={<Index />}    />
                <Route path="/admin/*" element={<Admin />}   />
                <Route path="/blog"   element={<Blog />}     />
                <Route path="*"       element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
