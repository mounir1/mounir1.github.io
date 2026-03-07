import React, { useState } from 'react';
import { Shield, Zap, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError, loginWithGitHub } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      setEmail('');
      setPassword('');
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-mesh">
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

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <Card className="glass-card w-full max-w-md animate-scale-in border-0 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-8 text-center">
            <div className="group relative mx-auto mb-6">
              <div className="absolute inset-0 animate-glow rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-75 blur-lg transition-opacity group-hover:opacity-100" />
              <div className="relative rounded-full bg-white p-4 dark:bg-gray-900">
                <img src="/mounir-icon.svg" alt="Admin" className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
              Welcome Back
            </CardTitle>
            <p className="mt-2 font-medium text-white/80">
              Portfolio Admin Panel
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="animate-slide-up rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Authentication Error</span>
                </div>
                <p className="mt-1 text-red-200">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium text-white/90">
                  <div className="h-4 w-1 rounded-full bg-gradient-to-b from-purple-400 to-pink-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400/50 focus:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium text-white/90">
                  <div className="h-4 w-1 rounded-full bg-gradient-to-b from-purple-400 to-pink-400" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400/50 focus:bg-white/15"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group relative h-14 w-full overflow-hidden border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 hover:shadow-xl"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-50" />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Access Admin Panel
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* GitHub Login Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-transparent px-4 text-xs text-white/60">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  clearError();
                  await loginWithGitHub();
                } catch (err) {
                  console.error('GitHub login failed:', err);
                }
              }}
              disabled={loading}
              className="group relative h-14 w-full overflow-hidden border-white/30 text-white transition-all duration-300 hover:bg-white/10"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Github className="h-5 w-5" />
                Continue with GitHub
              </span>
            </Button>

            {/* Footer */}
            <div className="pt-4 text-center">
              <p className="text-xs text-white/50">
                Secured by Firebase Authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
