import React, { useState, useCallback } from 'react';
import { Search, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { searchBrand, getBrandByDomain, type BrandAsset, type BrandSearchResult } from '@/lib/services/brandfetch';

interface BrandAssetPickerProps {
  onAssetSelect: (logoUrl: string, iconUrl: string, colors?: string[]) => void;
  currentLogoUrl?: string;
  label?: string;
  className?: string;
}

export function BrandAssetPicker({
  onAssetSelect,
  currentLogoUrl,
  label = 'Fetch Brand Assets',
  className = '',
}: BrandAssetPickerProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<BrandSearchResult[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    setSelectedBrand(null);

    try {
      // Try searching first
      const searchResults = await searchBrand(query.trim());
      
      if (searchResults.length > 0) {
        setResults(searchResults);
      } else {
        // If no search results, try direct domain lookup
        const brand = await getBrandByDomain(query.trim());
        if (brand) {
          setResults([{
            domain: query.trim(),
            name: query.trim(),
            logo: brand.logo,
            icon: brand.icon,
          }]);
        }
      }

      if (results.length === 0) {
        toast({
          title: 'No Results',
          description: `No brand assets found for "${query}"`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Failed to search for brand assets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, toast]);

  const handleSelectBrand = useCallback(async (result: BrandSearchResult) => {
    setSelectedBrand(result.domain);

    try {
      const brand = await getBrandByDomain(result.domain);
      if (brand) {
        onAssetSelect(brand.logo, brand.icon, brand.colors.palette);
        toast({
          title: 'Brand Assets Loaded',
          description: `Successfully loaded assets for ${result.name}`,
        });
      } else {
        // Use search results as fallback
        if (result.logo || result.icon) {
          onAssetSelect(result.logo, result.icon);
          toast({
            title: 'Brand Assets Loaded',
            description: `Loaded basic assets for ${result.name}`,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load brand details',
        variant: 'destructive',
      });
    }
  }, [onAssetSelect, toast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter company domain (e.g., apple.com, google.com)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          variant="outline"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-sm text-muted-foreground">
            Search Results ({results.length})
          </Label>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {results.map((result) => (
              <Card
                key={result.domain}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedBrand === result.domain ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleSelectBrand(result)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  {result.logo ? (
                    <img
                      src={result.logo}
                      alt={result.name}
                      className="h-10 w-10 rounded object-contain bg-white"
                    />
                  ) : result.icon ? (
                    <img
                      src={result.icon}
                      alt={result.name}
                      className="h-10 w-10 rounded object-contain bg-white"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.domain}
                    </div>
                  </div>
                  {selectedBrand === result.domain && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentLogoUrl && (
        <div className="mt-4">
          <Label className="text-sm text-muted-foreground">Current Logo</Label>
          <div className="mt-2 flex items-center gap-2 rounded border p-3">
            <img
              src={currentLogoUrl}
              alt="Current logo"
              className="h-12 w-12 object-contain"
            />
            <Badge variant="secondary">Loaded</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
