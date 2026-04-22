import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, AdminErrorFallback } from "@/components/ui/error-boundary";
import { UpdateNotification, NetworkStatus } from "@/components/ui/update-notification";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useTheme } from "@/hooks/useTheme";

// Lazy-load heavy pages
const Admin = lazy(() => import("./pages/Admin"));
const Blog = lazy(() => import("./pages/Blog"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      // @ts-expect-error cacheTime is valid in react-query v4
      cacheTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        const code = (error as { code?: string })?.code;
        if (code?.includes("auth/")) return false;
        return failureCount < 2;
      },
    },
  },
});

function ThemeInitialiser() {
  const { theme } = useTheme();
  useEffect(() => {
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeInitialiser />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/blog"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Blog />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <ErrorBoundary fallback={AdminErrorFallback}>
                  <Suspense fallback={<PageLoader />}>
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
