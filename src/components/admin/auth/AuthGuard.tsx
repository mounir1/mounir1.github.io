import React from 'react';
import { Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LoginForm } from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, canUseAdmin } = useAdminAuth();

  // If Firebase is not configured properly
  if (!canUseAdmin) {
    return (
      fallback || (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-mesh p-6">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-float rounded-full bg-purple-400/20 blur-3xl" />
            <div
              className="absolute right-1/4 top-3/4 h-96 w-96 animate-float rounded-full bg-blue-400/20 blur-3xl"
              style={{ animationDelay: '-3s' }}
            />
            <div
              className="absolute bottom-1/4 left-1/3 h-80 w-80 animate-float rounded-full bg-pink-400/20 blur-3xl"
              style={{ animationDelay: '-6s' }}
            />
          </div>

          <Card className="glass-card relative z-10 w-full max-w-lg animate-scale-in border-0 shadow-2xl backdrop-blur-xl">
            <CardHeader className="pb-8 text-center">
              <div className="group relative mx-auto mb-6">
                <div className="absolute inset-0 animate-glow rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-75 blur-lg transition-opacity group-hover:opacity-100" />
                <div className="relative rounded-full bg-white p-4 dark:bg-gray-900">
                  <img
                    src="/mounir-icon.svg"
                    alt="Admin"
                    className="h-12 w-12"
                  />
                </div>
              </div>
              <CardTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                Admin Panel Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Configuration Required</span>
                </div>
                <p className="text-sm text-red-200">
                  Firebase is not configured properly. Please check your
                  environment variables and restart the development server.
                </p>
              </div>

              <div className="space-y-1 text-xs text-white/50">
                <div>Required: Firebase Auth, Firestore Database</div>
                <div>
                  Check: .env.local file and VITE_FIREBASE_ENABLE_DEV=true
                </div>
              </div>

              <Button
                onClick={() => window.location.reload()}
                className="w-full border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
              >
                <Activity className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // If authenticated, render children
  return <>{children}</>;
}
