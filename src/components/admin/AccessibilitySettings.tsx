import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Eye,
  Volume2,
  Keyboard,
  Monitor,
  Settings,
  RefreshCw,
  Accessibility as AccessibilityIcon,
} from 'lucide-react';

export const AccessibilitySettings: React.FC = () => {
  const { preferences, updatePreference, resetPreferences } =
    useAccessibility();

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AccessibilityIcon className="h-5 w-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Visual Preferences */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
              <Eye className="h-4 w-4" />
              Visual Preferences
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={checked =>
                    updatePreference('highContrast', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <Switch
                  id="reduced-motion"
                  checked={preferences.reducedMotion}
                  onCheckedChange={checked =>
                    updatePreference('reducedMotion', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={value =>
                    updatePreference(
                      'fontSize',
                      value as 'small' | 'medium' | 'large' | 'extra-large'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select
                  value={preferences.colorScheme}
                  onValueChange={value =>
                    updatePreference(
                      'colorScheme',
                      value as 'light' | 'dark' | 'auto'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Interaction Preferences */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
              <Keyboard className="h-4 w-4" />
              Interaction Preferences
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-navigation">
                  Enhanced Keyboard Navigation
                </Label>
                <Switch
                  id="keyboard-navigation"
                  checked={preferences.keyboardNavigation}
                  onCheckedChange={checked =>
                    updatePreference('keyboardNavigation', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focus-visible">Visible Focus Indicators</Label>
                <Switch
                  id="focus-visible"
                  checked={preferences.focusVisible}
                  onCheckedChange={checked =>
                    updatePreference('focusVisible', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="skip-links">Skip Navigation Links</Label>
                <Switch
                  id="skip-links"
                  checked={preferences.skipLinks}
                  onCheckedChange={checked =>
                    updatePreference('skipLinks', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">
                  Screen Reader Optimizations
                </Label>
                <Switch
                  id="screen-reader"
                  checked={preferences.screenReader}
                  onCheckedChange={checked =>
                    updatePreference('screenReader', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Content Preferences */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
              <Volume2 className="h-4 w-4" />
              Content Preferences
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="captions">Auto-Enable Captions</Label>
                <Switch
                  id="captions"
                  checked={preferences.captions}
                  onCheckedChange={checked =>
                    updatePreference('captions', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                <Switch
                  id="audio-descriptions"
                  checked={preferences.audioDescriptions}
                  onCheckedChange={checked =>
                    updatePreference('audioDescriptions', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="simplified-interface">
                  Simplified Interface
                </Label>
                <Switch
                  id="simplified-interface"
                  checked={preferences.simplifiedInterface}
                  onCheckedChange={checked =>
                    updatePreference('simplifiedInterface', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay-media">Auto-play Media</Label>
                <Switch
                  id="autoplay-media"
                  checked={preferences.autoplayMedia}
                  onCheckedChange={checked =>
                    updatePreference('autoplayMedia', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Animation Preferences */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold">
              <Monitor className="h-4 w-4" />
              Animation Preferences
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="parallax-effects">Parallax Effects</Label>
                <Switch
                  id="parallax-effects"
                  checked={preferences.parallaxEffects}
                  onCheckedChange={checked =>
                    updatePreference('parallaxEffects', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="background-animations">
                  Background Animations
                </Label>
                <Switch
                  id="background-animations"
                  checked={preferences.backgroundAnimations}
                  onCheckedChange={checked =>
                    updatePreference('backgroundAnimations', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t pt-4">
            <Button
              onClick={resetPreferences}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
