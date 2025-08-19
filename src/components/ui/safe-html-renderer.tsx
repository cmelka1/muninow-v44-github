import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface SafeHtmlRendererProps {
  content: string | null | undefined;
  className?: string;
  fallback?: string;
}

export const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ 
  content, 
  className,
  fallback = 'No content provided' 
}) => {
  if (!content) {
    return <p className={cn("text-muted-foreground", className)}>{fallback}</p>;
  }

  // Configure DOMPurify to allow common rich text formatting
  const cleanHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none",
        "prose-p:text-sm prose-p:leading-relaxed prose-p:mb-2",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-em:italic prose-em:text-foreground",
        "prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-2 prose-ul:text-sm",
        "prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-2 prose-ol:text-sm",
        "prose-li:mb-1 prose-li:text-sm prose-li:leading-relaxed",
        "prose-headings:text-foreground prose-headings:font-semibold prose-headings:text-sm",
        "text-sm text-foreground leading-relaxed",
        className
      )}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};