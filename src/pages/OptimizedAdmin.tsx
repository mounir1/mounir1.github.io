/**
 * Professional Admin Panel
 * @author Mounir Abderrahmani
 * @description Clean, optimized admin interface with Firebase authentication
 */

import React, { useEffect, useState } from 'react';
import { auth, isFirebaseEnabled } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Zap, AlertCircle } from 'lucide-react';
import { ProfessionalAdminDashboard } from '@/components/admin/ProfessionalAdminDashboard';

export default function OptimizedAdmin() {
  const [user, setUser] = useState(() => auth?.currentUser ?? null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase Auth is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If Firebase is not configured
  if (!isFirebaseEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Configuration Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Firebase configuration is missing or incomplete. Please check your
              environment variables.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated, show the dashboard
  if (user) {
    return <ProfessionalAdminDashboard user={user} />;
  }

  // Login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        {/* Professional Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4">
            <img
              src="/mounir-signature.svg"
              alt="Mounir Signature"
              className="mx-auto h-12 w-auto"
              onError={e => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden text-2xl font-bold text-slate-900 dark:text-white">
              Mounir Abderrahmani
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            Professional Admin
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Portfolio Management System
          </p>
        </div>

        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-lg dark:bg-slate-900/80">
          <CardHeader className="pb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900 dark:text-white">
              Secure Access
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access the admin panel
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  className="h-12 border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  disabled={loading}
                  className="h-12 border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Protected by Firebase Authentication
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Mounir Abderrahmani. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
