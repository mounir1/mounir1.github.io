import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { uploadImageAutoPath, validateImageFile } from '@/lib/image-upload';
import { useTheme } from '@/components/theme/use-theme';

interface ImageUploadProps {
  onUploadComplete: (url: string, path: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  folder: string;
  label?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  onUploadComplete,
  onRemove,
  currentImageUrl,
  folder,
  label = 'Upload Image',
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { actualTheme } = useTheme();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        toast({
          title: 'Invalid File',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Create preview
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        // Upload to Firebase Storage
        const result = await uploadImageAutoPath(file, folder);

        // Notify parent component
        onUploadComplete(result.url, result.path);

        toast({
          title: 'Upload Successful',
          description: 'Image uploaded successfully!',
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image. Please try again.');
        setPreviewUrl(null);
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onUploadComplete, toast]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  }, [onRemove]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      <Card
        className={`border-0 shadow-sm ${actualTheme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'}`}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-4">
            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full rounded-md border object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${
                  actualTheme === 'dark'
                    ? 'border-slate-600 hover:border-primary/50'
                    : 'border-slate-300 hover:border-primary/50'
                }`}
                onClick={triggerFileInput}
              >
                <ImageIcon
                  className={`mb-2 h-8 w-8 ${actualTheme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}
                />
                <p
                  className={`text-center text-sm ${actualTheme === 'dark' ? 'text-slate-300' : 'text-muted-foreground'}`}
                >
                  Click to upload or drag and drop
                </p>
                <p
                  className={`mt-1 text-xs ${actualTheme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}
                >
                  Max file size: {maxSizeMB}MB
                </p>
              </div>
            )}

            <div className="flex w-full gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
