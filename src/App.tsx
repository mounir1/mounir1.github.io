import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { lazy, Suspense } from "react";

// ── Lazy-loaded pages (code-split at each route boundary) ─────────────────────
const Index    = lazy(() => import("./pages/Index"));
const Admin    = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ── Lightweight full-screen loading skeleton ──────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 min — data stays fresh
      gcTime:   10 * 60 * 1000,   // 10 min garbage-collect window
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"      element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*"      element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
