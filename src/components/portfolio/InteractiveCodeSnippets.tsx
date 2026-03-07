import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Play,
  Download,
  Code2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    label: 'JavaScript',
    icon: '🟨',
    extension: '.js',
    keywords: [
      'const',
      'let',
      'var',
      'function',
      'class',
      'import',
      'export',
      'if',
      'else',
      'for',
      'while',
      'return',
      'async',
      'await',
    ],
    comments: '//',
  },
  typescript: {
    label: 'TypeScript',
    icon: '🔷',
    extension: '.ts',
    keywords: [
      'interface',
      'type',
      'enum',
      'const',
      'let',
      'var',
      'function',
      'class',
      'import',
      'export',
    ],
    comments: '//',
  },
  react: {
    label: 'React JSX',
    icon: '⚛️',
    extension: '.jsx',
    keywords: [
      'const',
      'let',
      'function',
      'import',
      'export',
      'useState',
      'useEffect',
      'return',
    ],
    comments: '//',
  },
  python: {
    label: 'Python',
    icon: '🐍',
    extension: '.py',
    keywords: [
      'def',
      'class',
      'import',
      'from',
      'if',
      'else',
      'for',
      'while',
      'return',
      'try',
      'except',
    ],
    comments: '#',
  },
};

// Code themes
const CODE_THEMES = {
  light: {
    name: 'Light',
    background: '#ffffff',
    text: '#24292e',
    comment: '#6a737d',
    keyword: '#d73a49',
    string: '#032f62',
    border: '#e1e4e8',
  },
  dark: {
    name: 'Dark',
    background: '#0d1117',
    text: '#f0f6fc',
    comment: '#8b949e',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    border: '#30363d',
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    text: '#f8f8f2',
    comment: '#75715e',
    keyword: '#f92672',
    string: '#e6db74',
    border: '#49483e',
  },
};

// Sample code snippets
const SAMPLE_SNIPPETS = {
  react: `import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';

const InteractiveComponent = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Interactive Counter</h2>
      {isVisible && (
        <p className="text-lg mb-4">Count: {count}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={() => setCount(0)}>Reset</Button>
        <Button onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? 'Hide' : 'Show'} Counter
        </Button>
      </div>
    </div>
  );
};

export default InteractiveComponent;`,

  javascript: `// Advanced JavaScript Example
class DataProcessor {
  constructor(options = {}) {
    this.data = options.data || [];
    this.filters = new Map();
  }

  filter(key, predicate) {
    this.filters.set(key, predicate);
    return this;
  }

  async process() {
    let result = [...this.data];
    for (const [key, predicate] of this.filters) {
      result = result.filter(predicate);
    }
    return result;
  }

  static async fetchData(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    }
  }
}

const processor = new DataProcessor({ data: [1, 2, 3, 4, 5] });
processor.filter('even', n => n % 2 === 0).process();`,

  python: `"""Advanced Python example"""
import asyncio
import time
from typing import List, Dict

class AsyncDataProcessor:
    def __init__(self, batch_size: int = 10):
        self.batch_size = batch_size
    
    async def process_item(self, item: Dict) -> Dict:
        await asyncio.sleep(0.1)  # Simulate async operation
        return {
            **item,
            'processed': True,
            'timestamp': time.time()
        }
    
    async def process_all(self, data: List[Dict]) -> List[Dict]:
        results = []
        for i in range(0, len(data), self.batch_size):
            batch = data[i:i + self.batch_size]
            tasks = [self.process_item(item) for item in batch]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
        return results

# Usage
async def main():
    data = [{'name': 'Alice'}, {'name': 'Bob'}]
    processor = AsyncDataProcessor()
    results = await processor.process_all(data)
    print(results)

asyncio.run(main())`,
};

// Syntax highlighting function
const highlightSyntax = (code: string, language: string, theme: any) => {
  const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];
  if (!config) return code;

  let highlighted = code;

  // Highlight keywords
  config.keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(
      regex,
      `<span style="color: ${theme.keyword}; font-weight: 600;">${keyword}</span>`
    );
  });

  // Highlight strings
  highlighted = highlighted.replace(
    /'([^']*)'/g,
    `<span style="color: ${theme.string};">'$1'</span>`
  );
  highlighted = highlighted.replace(
    /"([^"]*)"/g,
    `<span style="color: ${theme.string};">"$1"</span>`
  );

  // Highlight comments
  if (config.comments === '//') {
    highlighted = highlighted.replace(
      /\/\/.*$/gm,
      match =>
        `<span style="color: ${theme.comment}; font-style: italic;">${match}</span>`
    );
  } else if (config.comments === '#') {
    highlighted = highlighted.replace(
      /#.*$/gm,
      match =>
        `<span style="color: ${theme.comment}; font-style: italic;">${match}</span>`
    );
  }

  return highlighted;
};

// Component interfaces
export interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
  filename?: string;
  theme?: string;
  maxHeight?: number;
  onRun?: (code: string) => void;
}

// Individual code snippet component
const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language,
  title,
  filename,
  theme = 'dark',
  maxHeight = 400,
  onRun,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const languageConfig =
    LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];
  const themeConfig = CODE_THEMES[theme as keyof typeof CODE_THEMES];
  const lines = code.split('\n');
  const shouldShowExpand = lines.length > 15;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const highlightedCode = highlightSyntax(code, language, themeConfig);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{languageConfig?.icon}</span>
            <div>
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{languageConfig?.label}</span>
                {filename && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{filename}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRun && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRun(code)}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>

            {shouldShowExpand && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          className="relative overflow-hidden"
          style={{
            maxHeight: isExpanded ? 'none' : `${maxHeight}px`,
            background: themeConfig.background,
            color: themeConfig.text,
            border: `1px solid ${themeConfig.border}`,
          }}
        >
          <div
            ref={codeRef}
            className="overflow-auto font-mono text-sm leading-relaxed"
          >
            <div className="flex">
              <div
                className="select-none border-r px-3 py-4 text-right"
                style={{
                  borderColor: themeConfig.border,
                  color: themeConfig.comment,
                }}
              >
                {lines.map((_, index) => (
                  <div key={index} className="h-6">
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1 px-4 py-4">
                <pre
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
export interface InteractiveCodeSnippetsProps {
  className?: string;
  snippets?: Record<string, string>;
  defaultLanguage?: string;
  defaultTheme?: string;
  onCodeRun?: (code: string, language: string) => void;
}

export const InteractiveCodeSnippets: React.FC<
  InteractiveCodeSnippetsProps
> = ({
  className,
  snippets = SAMPLE_SNIPPETS,
  defaultLanguage = 'react',
  defaultTheme = 'dark',
  onCodeRun,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme);
  const [customCode, setCustomCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const currentCode = customCode || snippets[selectedLanguage] || '';
  const languageConfig =
    LANGUAGE_CONFIG[selectedLanguage as keyof typeof LANGUAGE_CONFIG];

  const handleRun = (code: string) => {
    onCodeRun?.(code, selectedLanguage);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Language:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedLanguage === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedLanguage(key);
                      setCustomCode('');
                      setIsEditing(false);
                    }}
                    className="gap-2"
                  >
                    <span>{config.icon}</span>
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Theme:</span>
              <div className="flex gap-2">
                {Object.entries(CODE_THEMES).map(([key, theme]) => (
                  <Button
                    key={key}
                    variant={selectedTheme === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTheme(key)}
                    className="gap-2"
                  >
                    <div
                      className="h-3 w-3 rounded border"
                      style={{ backgroundColor: theme.background }}
                    />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                {isEditing ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={customCode || snippets[selectedLanguage] || ''}
              onChange={e => setCustomCode(e.target.value)}
              className="h-96 w-full resize-none rounded-lg border p-4 font-mono text-sm"
              placeholder={`Enter your ${languageConfig?.label} code here...`}
              style={{
                backgroundColor:
                  CODE_THEMES[selectedTheme as keyof typeof CODE_THEMES]
                    .background,
                color:
                  CODE_THEMES[selectedTheme as keyof typeof CODE_THEMES].text,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <CodeSnippet
          code={currentCode}
          language={selectedLanguage}
          title={`${languageConfig?.label} Example`}
          filename={`example${languageConfig?.extension}`}
          theme={selectedTheme}
          onRun={
            selectedLanguage === 'javascript' || selectedLanguage === 'react'
              ? handleRun
              : undefined
          }
        />
      )}
    </div>
  );
};

export interface InteractiveCodeSnippetsInterface {
  className?: string;
  snippets?: Record<string, string>;
  defaultLanguage?: string;
  defaultTheme?: string;
  onCodeRun?: (code: string, language: string) => void;
}

export default InteractiveCodeSnippets;
