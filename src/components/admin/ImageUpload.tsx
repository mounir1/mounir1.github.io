import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadImageAutoPath, validateImageFile } from "@/lib/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploadProps {
  onUploadComplete: (url: string, path: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  folder: string;
  label?: string;
  maxSizeMB?: number;
  className?: string;
  /** Shows a URL input tab as an alternative to file upload */
  showUrlTab?: boolean;
  onUrlChange?: (url: string) => void;
}

export function ImageUpload({
  onUploadComplete,
  onRemove,
  currentImageUrl,
  folder,
  label = "Upload Image",
  maxSizeMB = 5,
  className = "",
  showUrlTab = true,
  onUrlChange,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentImageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        toast({ title: "Invalid File", description: validation.error, variant: "destructive" });
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        const result = await uploadImageAutoPath(file, folder);
        onUploadComplete(result.url, result.path);

        toast({ title: "Upload Successful", description: "Image uploaded to Firebase Storage." });
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image. Please try again.");
        setPreviewUrl(currentImageUrl || null);
        toast({ title: "Upload Failed", description: "Failed to upload image. Please try again.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMB, onUploadComplete, currentImageUrl, toast]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setUrlInput("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemove?.();
  }, [onRemove]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    onUploadComplete(urlInput.trim(), "");
    onUrlChange?.(urlInput.trim());
  };

  const UploadArea = (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative w-full">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-40 w-full rounded-md border object-cover bg-muted"
            onError={() => setPreviewUrl(null)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2 h-7 w-7 p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors bg-muted/20"
          onClick={triggerFileInput}
        >
          <ImageIcon className="mb-2 h-7 w-7 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            JPEG, PNG, WebP, GIF · Max {maxSizeMB}MB
          </p>
        </div>
      )}

      <div className="flex gap-2">
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
          className="flex-1 text-sm"
          size="sm"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-3 w-3 animate-bounce" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3 w-3" />
              Choose File
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );

  const UrlArea = (
    <div className="space-y-3">
      {previewUrl && (
        <div className="relative w-full">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-40 w-full rounded-md border object-cover bg-muted"
            onError={() => setPreviewUrl(null)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2 h-7 w-7 p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/image.png"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleUrlApply}>
          <Link className="mr-1 h-3 w-3" />
          Apply
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter a direct image URL (Unsplash, CDN, etc.)
      </p>
    </div>
  );

  return (
    <div className={className}>
      {label && <Label className="mb-2 block text-sm font-medium">{label}</Label>}
      {showUrlTab ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-3 h-8 text-xs">
            <TabsTrigger value="upload" className="text-xs px-3">
              <Upload className="mr-1 h-3 w-3" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs px-3">
              <Link className="mr-1 h-3 w-3" />
              URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload">{UploadArea}</TabsContent>
          <TabsContent value="url">{UrlArea}</TabsContent>
        </Tabs>
      ) : (
        UploadArea
      )}
    </div>
  );
}
