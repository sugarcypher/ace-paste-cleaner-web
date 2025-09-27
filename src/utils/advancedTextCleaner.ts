// Advanced Text Sanitizer - Production-grade Unicode cleaning
// Based on comprehensive sanitization profile with language-aware processing

export interface AdvancedCleanProfile {
  version: string;
  normalize: 'NFC' | 'NFD' | 'NFKC' | 'NFKD';
  nfkc_compat: boolean;
  collapse_whitespace: boolean;
  strip_markup: {
    html_xml: boolean;
    markdown: boolean;
    code_fences: boolean;
  };
  remove_categories: {
    Cc_controls: boolean;
    Cf_format_controls: boolean;
    Cs_surrogates: boolean;
  };
  remove_noncharacters: boolean;
  remove_private_use: 'none' | 'bmp_only' | 'all';
  remove_isolated_combining_marks: boolean;
  strip_directionality_controls: boolean;
  strip_soft_hyphen_discretionary: boolean;
  strip_invisible_separators: boolean;
  strip_tag_chars: boolean;
  strip_variation_selectors: 'none' | 'emoji_safekeep' | 'all';
  strip_bom_anywhere: boolean;
  language_overrides: Record<string, { allow: string[]; comments?: string }>;
  hard_allowlist: string[];
  hard_blocklist: string[];
}

// Default profile for secure cleaning with cultural sensitivity
export const DEFAULT_ADVANCED_PROFILE: AdvancedCleanProfile = {
  version: "1.2",
  normalize: "NFC",
  nfkc_compat: false,
  collapse_whitespace: true,
  strip_markup: {
    html_xml: true,
    markdown: true,
    code_fences: true
  },
  remove_categories: {
    Cc_controls: true,
    Cf_format_controls: true,
    Cs_surrogates: true
  },
  remove_noncharacters: true,
  remove_private_use: "all",
  remove_isolated_combining_marks: true,
  strip_directionality_controls: true,
  strip_soft_hyphen_discretionary: true,
  strip_invisible_separators: true,
  strip_tag_chars: true,
  strip_variation_selectors: "emoji_safekeep",
  strip_bom_anywhere: true,
  language_overrides: {
    "ar": { allow: ["\u200D", "\u200C"], comments: "ZWJ/ZWNJ allowed for Arabic shaping exceptions." },
    "fa": { allow: ["\u200D", "\u200C"] },
    "ur": { allow: ["\u200D", "\u200C"] },
    "hi": { allow: ["\u200D", "\u200C"] },
    "bn": { allow: ["\u200D", "\u200C"] },
    "ml": { allow: ["\u200D", "\u200C"] },
    "ta": { allow: ["\u200D", "\u200C"] },
    "te": { allow: ["\u200D", "\u200C"] },
    "th": { allow: ["\u200B"], comments: "ZWSP permitted for Thai line-break hints." },
    "km": { allow: ["\u200B"] }
  },
  hard_allowlist: [
    "\uFE0E", // Text presentation selector
    "\uFE0F"  // Emoji presentation selector
  ],
  hard_blocklist: [
    "\u2060", // Word joiner
    "\u00AD", // Soft hyphen
    "\u180E", // Mongolian vowel separator
    "\uFEFF"  // Zero width no-break space (BOM)
  ]
};

// Common invisible characters set
const INVISIBLES = new Set([
  "\u200B", // ZERO WIDTH SPACE (ZWSP)
  "\u200C", // ZERO WIDTH NON-JOINER (ZWNJ)
  "\u200D", // ZERO WIDTH JOINER (ZWJ)
  "\u200E", // LRM
  "\u200F", // RLM
  "\u202A", "\u202B", "\u202C", "\u202D", "\u202E", // Bidi embedding/override
  "\u2066", "\u2067", "\u2068", "\u2069", // LRI/RLI/FSI/PDI
  "\u2060", // WORD JOINER
  "\u00AD", // SOFT HYPHEN
  "\u180E", // MONGOLIAN VOWEL SEPARATOR (historic)
  "\uFEFF", // ZERO WIDTH NO-BREAK SPACE (BOM)
]);

// Control characters regex
const CONTROL_REGEX = /[\u0000-\u001F\u007F]/g;

// HTML/Markdown regex patterns
const HTML_TAG_RE = /(?is)<(script|style)[\s\S]*?<\/\1>|<[^>]+>/g;
const MD_FENCE_RE = /^```[\s\S]*?^```$/gm;
const MD_INLINE_RE = /(`[^`]*`)|(\*\*?|__?|~~|>\s)/gm;

// Unicode utility functions
function isTagChar(ch: string): boolean {
  const cp = ch.codePointAt(0);
  return cp !== undefined && cp >= 0xE0000 && cp <= 0xE007F;
}

function isVariationSelector(ch: string, keepEmoji = false, keepAll = false): boolean {
  const cp = ch.codePointAt(0);
  if (!cp || keepAll) return false;
  if (keepEmoji && (cp === 0xFE0E || cp === 0xFE0F)) return false;
  return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF);
}

function isNonCharacter(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (!cp) return false;
  if (cp >= 0xFDD0 && cp <= 0xFDEF) return true;
  return (cp & 0xFFFF) === 0xFFFE || (cp & 0xFFFF) === 0xFFFF;
}

function isPrivateUse(ch: string, scope: string): boolean {
  const cp = ch.codePointAt(0);
  if (!cp || scope === "none") return false;
  if (cp >= 0xE000 && cp <= 0xF8FF) return true;
  if (scope === "all" && ((cp >= 0xF0000 && cp <= 0xFFFFD) || (cp >= 0x100000 && cp <= 0x10FFFD))) return true;
  return false;
}

// SECURITY: Safe HTML entity decoder to prevent double escaping/unescaping (CWE-116/CWE-020)
function safeDecodeHtmlEntities(text: string): string {
  // Use DOMParser or textarea element for robust entity decoding (browser environment)
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.textContent || textarea.innerText || "";
    } catch (e) {
      // Fallback to manual decoding if DOM methods fail
      console.warn("DOM-based entity decoding failed, using fallback:", e);
    }
  }
  
  // Fallback manual decoding for Node.js or when DOM fails
  // Process entities in specific order to avoid double-processing
  const entityMap: Record<string, string> = {
    '&amp;': '&',    // Process &amp; last to avoid double-decoding
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'"
  };
  
  // Replace all entities except &amp; first
  let result = text;
  Object.entries(entityMap).forEach(([entity, replacement]) => {
    if (entity !== '&amp;') {
      result = result.replace(new RegExp(entity, 'g'), replacement);
    }
  });
  
  // Process &amp; last to prevent double-decoding
  result = result.replace(/&amp;/g, '&');
  
  return result;
}

function stripMarkup(text: string, config: AdvancedCleanProfile['strip_markup']): string {
  if (config.html_xml) {
    // Remove HTML/XML tags first
    text = text.replace(HTML_TAG_RE, " ");
    // SECURITY: Use safe entity decoder to prevent double escaping/unescaping
    text = safeDecodeHtmlEntities(text);
  }
  
  if (config.code_fences) {
    text = text.replace(MD_FENCE_RE, " ");
  }
  
  if (config.markdown) {
    text = text.replace(MD_INLINE_RE, " ");
    // Common MD links/images: [text](url)
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
    text = text.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
  }
  
  return text;
}

function collapseWhitespace(text: string): string {
  text = text.replace(/[ \t\r\f\v]+/g, " ");
  text = text.replace(/\s*\n\s*/g, "\n");
  return text.trim();
}

function removeIsolatedCombining(text: string): string {
  // Drop combining marks that start a string or follow non-spacing-inert char
  const out: string[] = [];
  let prevBase = false;
  
  for (const ch of text) {
    // Check if character is a combining mark (simplified check)
    const cp = ch.codePointAt(0);
    const isCombining = cp !== undefined && (
      (cp >= 0x0300 && cp <= 0x036F) || // Combining Diacritical Marks
      (cp >= 0x1AB0 && cp <= 0x1AFF) || // Combining Diacritical Marks Extended
      (cp >= 0x1DC0 && cp <= 0x1DFF) || // Combining Diacritical Marks Supplement
      (cp >= 0x20D0 && cp <= 0x20FF) || // Combining Diacritical Marks for Symbols
      (cp >= 0xFE20 && cp <= 0xFE2F)    // Combining Half Marks
    );
    
    if (isCombining) {
      if (!prevBase) {
        continue; // drop isolated combining mark
      }
      out.push(ch);
      prevBase = true;
    } else {
      out.push(ch);
      // treat whitespace and controls as non-base
      prevBase = !/[\s\p{C}]/u.test(ch);
    }
  }
  
  return out.join("");
}

export function sanitizeTextAdvanced(
  text: string, 
  profile: AdvancedCleanProfile = DEFAULT_ADVANCED_PROFILE, 
  lang?: string
): string {
  if (!text || typeof text !== 'string') return '';
  
  // 1) Optional markup strip
  if (profile.strip_markup.html_xml || profile.strip_markup.markdown) {
    text = stripMarkup(text, profile.strip_markup);
  }
  
  // 2) Normalize early (optionally NFKC for aggressive compatibility)
  try {
    if (profile.nfkc_compat) {
      text = text.normalize("NFKC");
    } else {
      text = text.normalize(profile.normalize);
    }
  } catch (e) {
    // Fallback to NFC if normalization fails
    text = text.normalize("NFC");
  }
  
  // 3) Build allowlist for the selected language
  const langAllow = new Set(profile.language_overrides[lang || ""]?.allow || []);
  const hardAllow = new Set(profile.hard_allowlist);
  const allow = new Set([...langAllow, ...hardAllow]);
  
  // 4) Character-by-character filtering
  const keepEmojiVS = profile.strip_variation_selectors === "emoji_safekeep";
  const keepAllVS = profile.strip_variation_selectors === "none";
  
  const out: string[] = [];
  for (const ch of text) {
    // Hard allow always wins
    if (allow.has(ch)) {
      out.push(ch);
      continue;
    }
    
    // Controls
    if (profile.remove_categories.Cc_controls && CONTROL_REGEX.test(ch)) {
      CONTROL_REGEX.lastIndex = 0; // Reset regex state
      continue;
    }
    CONTROL_REGEX.lastIndex = 0; // Reset regex state
    
    // BOM anywhere
    if (profile.strip_bom_anywhere && ch === "\uFEFF") {
      continue;
    }
    
    // Format controls (Cf) - simplified check
    if (profile.remove_categories.Cf_format_controls) {
      try {
        if (/\p{Cf}/u.test(ch)) {
          if (allow.has(ch)) {
            out.push(ch);
          }
          continue;
        }
      } catch (e) {
        // Fallback for browsers without Unicode property support
        if (INVISIBLES.has(ch) && !allow.has(ch)) {
          continue;
        }
      }
    }
    
    // Invisibles common set
    if (profile.strip_invisible_separators && INVISIBLES.has(ch) && !allow.has(ch)) {
      continue;
    }
    
    // Soft hyphen discretionary
    if (profile.strip_soft_hyphen_discretionary && ch === "\u00AD") {
      continue;
    }
    
    // Tag chars
    if (profile.strip_tag_chars && isTagChar(ch)) {
      continue;
    }
    
    // Variation selectors
    if (profile.strip_variation_selectors === "all" || profile.strip_variation_selectors === "emoji_safekeep") {
      if (isVariationSelector(ch, keepEmojiVS, keepAllVS)) {
        continue;
      }
    }
    
    // Noncharacters
    if (profile.remove_noncharacters && isNonCharacter(ch)) {
      continue;
    }
    
    // Private-use
    if (isPrivateUse(ch, profile.remove_private_use)) {
      continue;
    }
    
    out.push(ch);
  }
  
  text = out.join("");
  
  // 5) Remove isolated combining marks if requested
  if (profile.remove_isolated_combining_marks) {
    text = removeIsolatedCombining(text);
  }
  
  // 6) Strip bidi controls if requested (after combining tidy)
  if (profile.strip_directionality_controls) {
    text = text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  }
  
  // 7) Collapse whitespace / newlines
  if (profile.collapse_whitespace) {
    text = collapseWhitespace(text);
  }
  
  // 8) Final normalize pass
  try {
    text = text.normalize(profile.normalize);
  } catch (e) {
    text = text.normalize("NFC");
  }
  
  return text;
}

// Preset profiles for different use cases
export const PRESET_PROFILES = {
  EMOJI_SAFE: {
    ...DEFAULT_ADVANCED_PROFILE,
    strip_variation_selectors: "emoji_safekeep" as const,
  },
  MAX_STERILE: {
    ...DEFAULT_ADVANCED_PROFILE,
    strip_variation_selectors: "all" as const,
    remove_private_use: "all" as const,
    nfkc_compat: true,
  },
  MARKUP_INTACT: {
    ...DEFAULT_ADVANCED_PROFILE,
    strip_markup: {
      html_xml: false,
      markdown: false,
      code_fences: false
    }
  }
};