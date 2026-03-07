import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { isFirebaseEnabled, firebaseConfig } from '@/lib/firebase';

interface FirebaseConfigCheckerProps {
  showDetails?: boolean;
  className?: string;
}

export const FirebaseConfigChecker: React.FC<FirebaseConfigCheckerProps> = ({
  showDetails = false,
  className,
}) => {
  const configStatus = {
    apiKey: Boolean(
      firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('demo')
    ),
    authDomain: Boolean(
      firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('demo')
    ),
    projectId: Boolean(
      firebaseConfig.projectId && !firebaseConfig.projectId.includes('demo')
    ),
    storageBucket: Boolean(
      firebaseConfig.storageBucket &&
        !firebaseConfig.storageBucket.includes('demo')
    ),
    messagingSenderId: Boolean(
      firebaseConfig.messagingSenderId &&
        !firebaseConfig.messagingSenderId.includes('123')
    ),
    appId: Boolean(
      firebaseConfig.appId && !firebaseConfig.appId.includes('demo')
    ),
  };

  const isProperlyConfigured = Object.values(configStatus).every(Boolean);
  const isDemoMode = !isProperlyConfigured && import.meta.env.DEV;
  const isProductionWithoutConfig =
    !isProperlyConfigured && import.meta.env.PROD;

  if (isProperlyConfigured && !showDetails) {
    return null; // Don't show anything if properly configured and details not requested
  }

  return (
    <div className={className}>
      {/* Main Status Alert */}
      {isProductionWithoutConfig && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Firebase Configuration Required</strong>
            <br />
            Firebase is not configured properly. Please check your environment
            variables and restart the development server.
          </AlertDescription>
        </Alert>
      )}

      {isDemoMode && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Demo Mode Active</strong>
            <br />
            Running with demo Firebase configuration. Some features may not work
            properly.
          </AlertDescription>
        </Alert>
      )}

      {isProperlyConfigured && showDetails && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Firebase Configured</strong>
            <br />
            All Firebase services are properly configured and ready to use.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Configuration Status */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Firebase Configuration Status
            </CardTitle>
            <CardDescription>
              Current status of Firebase environment variables and services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Environment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Firebase Enabled:</strong>{' '}
                {isFirebaseEnabled ? 'Yes' : 'No'}
              </div>
            </div>

            {/* Configuration Items */}
            <div className="space-y-2">
              <h4 className="font-medium">Configuration Variables:</h4>
              <div className="grid gap-2">
                {Object.entries(configStatus).map(([key, isValid]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <span className="font-mono text-sm">
                      VITE_FIREBASE_{key.toUpperCase()}
                    </span>
                    <Badge variant={isValid ? 'default' : 'destructive'}>
                      {isValid ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Configured
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" /> Missing
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Instructions */}
            {!isProperlyConfigured && (
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <h4 className="font-medium">Setup Instructions:</h4>
                <ol className="list-inside list-decimal space-y-2 text-sm">
                  <li>
                    Create a Firebase project at{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Firebase Console <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Enable Authentication and Firestore Database</li>
                  <li>Get your project configuration from Project Settings</li>
                  <li>
                    Create a{' '}
                    <code className="rounded bg-background px-1">
                      .env.local
                    </code>{' '}
                    file in your project root
                  </li>
                  <li>Add the following environment variables:</li>
                </ol>

                <div className="overflow-x-auto rounded border bg-background p-3 font-mono text-xs">
                  <div>VITE_FIREBASE_API_KEY=your_api_key</div>
                  <div>
                    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
                  </div>
                  <div>VITE_FIREBASE_PROJECT_ID=your_project_id</div>
                  <div>
                    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
                  </div>
                  <div>VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
                  <div>VITE_FIREBASE_APP_ID=your_app_id</div>
                  <div>VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id</div>
                </div>

                <p className="text-sm text-muted-foreground">
                  After adding the environment variables, restart your
                  development server.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Configuration
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  Firebase Console <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseConfigChecker;
