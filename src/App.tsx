import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, AdminErrorFallback } from "@/components/ui/error-boundary";
import { UpdateNotification, NetworkStatus } from "@/components/ui/update-notification";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (gcTime replaces deprecated cacheTime in v5)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.code?.includes('auth/')) return false;
        return failureCount < 2;
      },
    },
  },
});

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
                  <Admin />
                </ErrorBoundary>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        {/* PWA and Offline Features */}
        <UpdateNotification />
        <NetworkStatus />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

