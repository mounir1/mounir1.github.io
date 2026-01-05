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
    <div className="min-h-screen relative overflow-hidden bg-gradient-mesh">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-6">
        <Card className="glass-card max-w-md w-full shadow-2xl animate-scale-in border-0 backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-glow transition-opacity" />
              <div className="relative bg-white dark:bg-gray-900 rounded-full p-4">
                <img src="/mounir-icon.svg" alt="Admin" className="w-12 h-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-white/80 mt-2 font-medium">Portfolio Admin Panel</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm animate-slide-up">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Authentication Error</span>
                </div>
                <p className="mt-1 text-red-200">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="text-white/90 font-medium flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                  Email Address
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={loading}
                  required 
                  className="h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90 font-medium flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                  Password
                </Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={loading}
                  required 
                  className="h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
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
                <span className="px-4 bg-transparent text-white/60 text-xs">OR CONTINUE WITH</span>
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
              className="w-full h-14 border-white/30 text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Github className="w-5 h-5" />
                Continue with GitHub
              </span>
            </Button>
            
            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-white/50 text-xs">
                Secured by Firebase Authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}