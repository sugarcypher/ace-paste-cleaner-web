interface CleanOptions {
  removeInvisible?: boolean;
  stripMarkdownHeaders?: boolean;
  stripBoldItalic?: boolean;
  stripBackticks?: boolean;
  normalizeWhitespace?: boolean;
  collapseBlankLines?: boolean;
  removeUrls?: boolean;
  removeEmailAddresses?: boolean;
  removePhoneNumbers?: boolean;
}

export function cleanText(text: string, options: CleanOptions = {}): string {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  
  // Remove invisible characters
  if (options.removeInvisible !== false) {
    cleaned = cleaned
      .replace(/[\u200B\u200C\u200D\u2060\u00AD\u202C\u202D\u202E\u2066\u2067\u2068\u2069\uFEFF]/g, '') // Zero-width characters
      .replace(/[\u00A0]/g, ' '); // Non-breaking space to regular space
  }
  
  // Strip markdown headers
  if (options.stripMarkdownHeaders) {
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  }
  
  // Strip bold/italic
  if (options.stripBoldItalic) {
    cleaned = cleaned
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/__([^_]+)__/g, '$1') // Underline bold
      .replace(/_([^_]+)_/g, '$1'); // Underline italic
  }
  
  // Strip backticks (code blocks)
  if (options.stripBackticks) {
    cleaned = cleaned
      .replace(/```[\s\S]*?```/g, '') // Fenced code blocks
      .replace(/`([^`]+)`/g, '$1'); // Inline code
  }
  
  // Remove URLs
  if (options.removeUrls) {
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  }
  
  // Remove email addresses
  if (options.removeEmailAddresses) {
    cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '');
  }
  
  // Remove phone numbers
  if (options.removePhoneNumbers) {
    cleaned = cleaned.replace(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '');
  }
  
  // Normalize whitespace
  if (options.normalizeWhitespace !== false) {
    cleaned = cleaned
      .replace(/\t/g, ' ') // Tabs to spaces
      .replace(/  +/g, ' '); // Multiple spaces to single space
  }
  
  // Collapse blank lines
  if (options.collapseBlankLines !== false) {
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  }
  
  // Trim whitespace from beginning and end
  cleaned = cleaned.trim();
  
  return cleaned;
}