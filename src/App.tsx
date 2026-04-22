import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, AdminErrorFallback } from "@/components/ui/error-boundary";
import { UpdateNotification, NetworkStatus } from "@/components/ui/update-notification";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load Admin so it is split into its own JS chunk
// — portfolio visitors never download admin code
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        const e = error as { code?: string } | null;
        if (e?.code?.includes("auth/")) return false;
        return failureCount < 2;
      },
    },
  },
});

function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading admin panel…</p>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/admin"
              element={
                <ErrorBoundary fallback={AdminErrorFallback}>
                  <Suspense fallback={<AdminLoading />}>
                    <Admin />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <UpdateNotification />
        <NetworkStatus />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
