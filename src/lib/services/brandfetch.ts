/**
 * Brandfetch API Service
 * Fetch professional brand assets (logos, colors, fonts) for companies
 * API Key: unDIl5ubQG7RGBkWsLCkDbdKy1WAgi0Zda49pH3VLUgUe_L3RfYJ0q9gV9zsf-4XwGJ-6wKYWBMH6zXyMnND8A
 */

const BRANDFETCH_API_KEY = 'unDIl5ubQG7RGBkWsLCkDbdKy1WAgi0Zda49pH3VLUgUe_L3RfYJ0q9gV9zsf-4XwGJ-6wKYWBMH6zXyMnND8A';
const BRANDFETCH_BASE_URL = 'https://api.brandfetch.io/v2';

export interface BrandAsset {
  logo: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    palette: string[];
  };
  fonts: string[];
}

export interface BrandSearchResult {
  domain: string;
  name: string;
  logo: string;
  icon: string;
}

/**
 * Search for brands by domain or name
 */
export async function searchBrand(query: string): Promise<BrandSearchResult[]> {
  try {
    const response = await fetch(
      `${BRANDFETCH_BASE_URL}/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Brandfetch API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((brand: any) => ({
      domain: brand.domain || '',
      name: brand.name || '',
      logo: brand.logos?.[0]?.href || brand.icon?.href || '',
      icon: brand.icon?.href || brand.logos?.[0]?.href || '',
    }));
  } catch (error) {
    console.error('Error searching brand:', error);
    return [];
  }
}

/**
 * Get detailed brand information by domain
 */
export async function getBrandByDomain(domain: string): Promise<BrandAsset | null> {
  try {
    const response = await fetch(
      `${BRANDFETCH_BASE_URL}/${encodeURIComponent(domain)}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      logo: data.logos?.find((l: any) => l.formats?.includes('svg'))?.href ||
            data.logos?.[0]?.href || '',
      icon: data.icon?.href || data.logos?.[0]?.href || '',
      colors: {
        primary: data.colors?.[0]?.hex || '#000000',
        secondary: data.colors?.[1]?.hex || '#666666',
        palette: data.colors?.map((c: any) => c.hex) || [],
      },
      fonts: data.fonts?.map((f: any) => f.name) || [],
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

/**
 * Get brand logo URL by domain
 */
export async function getBrandLogo(domain: string, format: 'svg' | 'png' = 'svg'): Promise<string | null> {
  try {
    const response = await fetch(
      `${BRANDFETCH_BASE_URL}/${encodeURIComponent(domain)}/logo`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const logo = data.logos?.find((l: any) => l.formats?.includes(format)) || data.logos?.[0];
    return logo?.href || null;
  } catch (error) {
    console.error('Error fetching brand logo:', error);
    return null;
  }
}

/**
 * Get brand icon URL by domain
 */
export async function getBrandIcon(domain: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${BRANDFETCH_BASE_URL}/${encodeURIComponent(domain)}/icon`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.icon?.href || null;
  } catch (error) {
    console.error('Error fetching brand icon:', error);
    return null;
  }
}

/**
 * Fetch brand colors by domain
 */
export async function getBrandColors(domain: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${BRANDFETCH_BASE_URL}/${encodeURIComponent(domain)}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.colors?.map((c: any) => c.hex) || [];
  } catch (error) {
    console.error('Error fetching brand colors:', error);
    return [];
  }
}
