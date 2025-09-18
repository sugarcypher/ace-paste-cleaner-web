import React, { useMemo, useState } from "react";
import { useUsage } from "./hooks/useUsage";
import { PaywallModal } from "./components/PaywallModal";
import { UsageIndicator } from "./components/UsageIndicator";
import { SecurityBadge } from "./components/SecurityBadge";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { SecurityPolicy } from "./components/SecurityPolicy";
import { PrivacyAgreement } from "./components/PrivacyAgreement";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext";
import { detectInvisibleCharacters, stripInvisibleCharacters } from "./utils/advancedInvisibleCharacters";

interface CleanOptions {
  removeInvisible: boolean;
  keepVS16Emoji: boolean;
  preserveEmoji: boolean;
  stripMarkdownHeaders: boolean;
  stripBoldItalic: boolean;
  stripBackticks: boolean;
  stripEmDashSeparators: boolean;
  stripListMarkers: boolean;
  stripBlockquotes: boolean;
  normalizeWhitespace: boolean;
  collapseBlankLines: boolean;
  // Additional options for removing other things
  removeUrls: boolean;
  removeEmailAddresses: boolean;
  removePhoneNumbers: boolean;
  removeTimestamps: boolean;
  removeSpecialCharacters: boolean;
  removeExtraPunctuation: boolean;
  removeRepeatedWords: boolean;
  removeEmptyLines: boolean;
  removeTrailingSpaces: boolean;
  removeLeadingSpaces: boolean;
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

interface StatsProps {
  input: string;
  output: string;
  opts: CleanOptions;
}

interface MetricProps {
  k: string;
  v: string;
  isActive?: boolean;
}

function AppContent() {
  const [input, setInput] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPrivacyAgreement, setShowPrivacyAgreement] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'daily_limit' | 'text_length' | 'feature_required'>('daily_limit');
  const { user, usage, recordCleaning, canClean, getRemainingCleanings, upgradeUser } = useUsage();
  const { hasAcceptedTerms, securitySettings } = useSecurity();
  
  const [opts, setOpts] = useState<CleanOptions>({
    removeInvisible: true,
    keepVS16Emoji: true,
    preserveEmoji: true,
    stripMarkdownHeaders: true,
    stripBoldItalic: true,
    stripBackticks: true,
    stripEmDashSeparators: true,
    stripListMarkers: true,
    stripBlockquotes: true,
    normalizeWhitespace: true,
    collapseBlankLines: true,
    removeUrls: false,
    removeEmailAddresses: false,
    removePhoneNumbers: false,
    removeTimestamps: false,
    removeSpecialCharacters: false,
    removeExtraPunctuation: false,
    removeRepeatedWords: false,
    removeEmptyLines: false,
    removeTrailingSpaces: false,
    removeLeadingSpaces: false,
  });

  function toggle(key: keyof CleanOptions) {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  const cleaned = useMemo(() => {
    if (!canClean(input.length)) {
      return input; // Return original text if can't clean
    }
    
    // Use advanced invisible character detection if enabled
    if (opts.removeInvisible && securitySettings.encryptionLevel === 'enhanced') {
      return stripInvisibleCharacters(cleanText(input, opts));
    }
    
    return cleanText(input, opts);
  }, [input, opts, canClean, securitySettings]);

  const handleClean = () => {
    if (!canClean(input.length)) {
      if (input.length > 2000) {
        setPaywallReason('text_length');
      } else {
        setPaywallReason('daily_limit');
      }
      setShowPaywall(true);
      return;
    }
    
    // Record the cleaning usage
    recordCleaning(input.length);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to paste text: ', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-5xl grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Ace Paste — Cleaner</h1>
          <div className="flex gap-2">
            {!hasAcceptedTerms && (
              <button
                onClick={() => setShowPrivacyAgreement(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-400 active:translate-y-[1px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy Agreement
              </button>
            )}
            <button
              onClick={pasteFromClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 text-yellow-950 font-medium hover:bg-yellow-400 active:translate-y-[1px] animate-pulse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Paste
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-medium hover:bg-emerald-400 active:translate-y-[1px] animate-pulse"
            >
              Copy cleaned
            </button>
          </div>
        </header>

        {/* Usage Indicator */}
        <UsageIndicator 
          user={user} 
          usage={usage} 
          onUpgrade={() => setShowPaywall(true)} 
        />

        {/* Security Badge */}
        <SecurityBadge />

        {/* Options Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <OptionGroup 
            title="Text Formatting" 
            options={[
              { key: 'stripMarkdownHeaders', label: 'Markdown Headers' },
              { key: 'stripBoldItalic', label: 'Bold/Italic Markers' },
              { key: 'stripBackticks', label: 'Code Blocks' },
              { key: 'stripListMarkers', label: 'List Markers' },
              { key: 'stripBlockquotes', label: 'Blockquotes' },
              { key: 'stripEmDashSeparators', label: 'Em-dash Separators' }
            ]}
            opts={opts}
            toggle={toggle}
          />
          
          <OptionGroup 
            title="Content Removal" 
            options={[
              { key: 'removeUrls', label: 'URLs' },
              { key: 'removeEmailAddresses', label: 'Email Addresses' },
              { key: 'removePhoneNumbers', label: 'Phone Numbers' },
              { key: 'removeTimestamps', label: 'Timestamps' },
              { key: 'removeSpecialCharacters', label: 'Special Characters' },
              { key: 'removeRepeatedWords', label: 'Repeated Words' }
            ]}
            opts={opts}
            toggle={toggle}
          />
          
          <OptionGroup 
            title="Whitespace & Invisible" 
            options={[
              { key: 'removeInvisible', label: 'Invisible Characters' },
              { key: 'keepVS16Emoji', label: 'Keep Emoji VS16' },
              { key: 'preserveEmoji', label: 'Preserve Emoji Sequences' },
              { key: 'normalizeWhitespace', label: 'Normalize Whitespace' },
              { key: 'collapseBlankLines', label: 'Collapse Blank Lines' },
              { key: 'removeEmptyLines', label: 'Remove Empty Lines' },
              { key: 'removeTrailingSpaces', label: 'Remove Trailing Spaces' },
              { key: 'removeLeadingSpaces', label: 'Remove Leading Spaces' }
            ]}
            opts={opts}
            toggle={toggle}
          />
        </div>

        {/* Input and Output - Stacked Vertically */}
        <div className="grid gap-6">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wider text-neutral-400">Input</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setInput(""); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={pasteFromClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500 text-yellow-950 hover:bg-yellow-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here..."
              className="h-[30vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* What was removed section - between input and output */}
          <Stats input={input} output={cleaned} opts={opts} />

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wider text-neutral-400">Output</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setInput(""); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Clean
                </button>
              </div>
            </div>
            <textarea
              value={cleaned}
              readOnly
              className="h-[30vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-400">
              © 2025 Ace Paste Cleaner. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowSecurity(true)}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Security Policy
              </button>
              <a
                href="https://github.com/sugarcypher/Ace-Paste-Cleaner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={(tierId) => {
          upgradeUser(tierId);
          setShowPaywall(false);
        }}
        currentTier={user?.tier || 'free'}
        reason={paywallReason}
        currentTextLength={input.length}
      />

      <PrivacyPolicy
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <SecurityPolicy
        isOpen={showSecurity}
        onClose={() => setShowSecurity(false)}
      />

      <PrivacyAgreement
        isOpen={showPrivacyAgreement}
        onClose={() => setShowPrivacyAgreement(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <AppContent />
    </SecurityProvider>
  );
}

function Check({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer select-none">
      <input type="checkbox" className="size-4 accent-emerald-500" checked={checked} onChange={onChange} />
      <span className="text-sm text-neutral-200">{label}</span>
    </label>
  );
}

interface OptionGroupProps {
  title: string;
  options: Array<{ key: keyof CleanOptions; label: string }>;
  opts: CleanOptions;
  toggle: (key: keyof CleanOptions) => void;
}

function OptionGroup({ title, options, opts, toggle }: OptionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const enabledCount = options.filter(opt => opts[opt.key]).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">{title}</span>
          {enabledCount > 0 && (
            <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-full">
              {enabledCount}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <label key={option.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="size-4 accent-emerald-500" 
                checked={opts[option.key]} 
                onChange={() => toggle(option.key)} 
              />
              <span className="text-sm text-neutral-200">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Stats({ input, output, opts }: StatsProps) {
  const invCounts = useMemo(() => countInvisibles(input, opts), [input, opts]);
  const removedChars = Math.max(0, input.length - output.length);
  
  // Track previous values for color activation
  const [prevValues, setPrevValues] = useState({ length: 0, removed: 0, types: 0 });
  
  // Calculate what was actually removed based on options
  const removedItems = useMemo(() => {
    const items = [];
    
    if (opts.removeInvisible) {
      const totalInvisible = invCounts.zwsp + invCounts.wj + invCounts.zwnj + invCounts.zwj + invCounts.shy + invCounts.ltrRtl + invCounts.bom;
      if (totalInvisible > 0) {
        const details = [];
        if (invCounts.zwsp > 0) details.push(`${invCounts.zwsp} Zero Width Spaces`);
        if (invCounts.wj > 0) details.push(`${invCounts.wj} Word Joiners`);
        if (invCounts.zwnj > 0) details.push(`${invCounts.zwnj} Zero Width Non-Joiners`);
        if (invCounts.zwj > 0) details.push(`${invCounts.zwj} Zero Width Joiners`);
        if (invCounts.shy > 0) details.push(`${invCounts.shy} Soft Hyphens`);
        if (invCounts.ltrRtl > 0) details.push(`${invCounts.ltrRtl} Direction Marks`);
        if (invCounts.bom > 0) details.push(`${invCounts.bom} Byte Order Marks`);
        items.push({ type: 'invisible', count: totalInvisible, label: 'Invisible Characters', details });
      }
    }
    
    if (opts.stripMarkdownHeaders) {
      const headerMatches = input.match(/^\s{0,3}(#{1,6})\s+/gmu) || [];
      if (headerMatches.length > 0) {
        const details = headerMatches.map(h => h.trim());
        items.push({ type: 'markdown', count: headerMatches.length, label: 'Markdown Headers', details });
      }
    }
    
    if (opts.stripBoldItalic) {
      const boldMatches = input.match(/\*\*.*?\*\*/gmsu) || [];
      const italicMatches = input.match(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/gmsu) || [];
      const underlineMatches = input.match(/__.*?__/gmsu) || [];
      const strikeMatches = input.match(/~~.*?~~/gmsu) || [];
      const totalFormatting = boldMatches.length + italicMatches.length + underlineMatches.length + strikeMatches.length;
      
      if (totalFormatting > 0) {
        const details = [];
        if (boldMatches.length > 0) details.push(`${boldMatches.length} Bold markers (**)`);
        if (italicMatches.length > 0) details.push(`${italicMatches.length} Italic markers (*)`);
        if (underlineMatches.length > 0) details.push(`${underlineMatches.length} Underline markers (__)`);
        if (strikeMatches.length > 0) details.push(`${strikeMatches.length} Strikethrough markers (~~)`);
        items.push({ type: 'formatting', count: totalFormatting, label: 'Text Formatting', details });
      }
    }
    
    if (opts.stripBackticks) {
      const inlineMatches = input.match(/`[^`]+`/gmu) || [];
      const fencedMatches = input.match(/^```[\s\S]*?```/gmu) || [];
      const totalCode = inlineMatches.length + fencedMatches.length;
      
      if (totalCode > 0) {
        const details = [];
        if (inlineMatches.length > 0) details.push(`${inlineMatches.length} Inline code blocks`);
        if (fencedMatches.length > 0) details.push(`${fencedMatches.length} Fenced code blocks`);
        items.push({ type: 'code', count: totalCode, label: 'Code Blocks', details });
      }
    }
    
    if (opts.removeUrls) {
      const urlMatches = input.match(/https?:\/\/[^\s]+|www\.[^\s]+/g) || [];
      if (urlMatches.length > 0) {
        const details = urlMatches.slice(0, 5); // Show first 5 URLs
        if (urlMatches.length > 5) details.push(`... and ${urlMatches.length - 5} more`);
        items.push({ type: 'urls', count: urlMatches.length, label: 'URLs', details });
      }
    }
    
    if (opts.removeEmailAddresses) {
      const emailMatches = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
      if (emailMatches.length > 0) {
        const details = emailMatches.slice(0, 3); // Show first 3 emails
        if (emailMatches.length > 3) details.push(`... and ${emailMatches.length - 3} more`);
        items.push({ type: 'emails', count: emailMatches.length, label: 'Email Addresses', details });
      }
    }
    
    if (opts.removePhoneNumbers) {
      const phoneMatches = input.match(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g) || [];
      if (phoneMatches.length > 0) {
        const details = phoneMatches.slice(0, 3); // Show first 3 phones
        if (phoneMatches.length > 3) details.push(`... and ${phoneMatches.length - 3} more`);
        items.push({ type: 'phones', count: phoneMatches.length, label: 'Phone Numbers', details });
      }
    }
    
    if (opts.removeTimestamps) {
      const timeMatches = input.match(/\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?\b/g) || [];
      const dateMatches = input.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g) || [];
      const totalTimestamps = timeMatches.length + dateMatches.length;
      
      if (totalTimestamps > 0) {
        const details = [];
        if (timeMatches.length > 0) details.push(`${timeMatches.length} Time formats`);
        if (dateMatches.length > 0) details.push(`${dateMatches.length} Date formats`);
        items.push({ type: 'timestamps', count: totalTimestamps, label: 'Timestamps', details });
      }
    }
    
    if (opts.removeSpecialCharacters) {
      const specialMatches = input.match(/[!@#$%^&*_+=\[\]{}|\\:"'<>~`]/g) || [];
      if (specialMatches.length > 0) {
        const details = [...new Set(specialMatches)].slice(0, 10); // Show unique characters
        if (specialMatches.length > 10) details.push(`... and ${specialMatches.length - 10} more`);
        items.push({ type: 'special', count: specialMatches.length, label: 'Special Characters', details });
      }
    }
    
    if (opts.removeRepeatedWords) {
      const repeatedMatches = input.match(/\b(\w+)\s+\1\b/g) || [];
      if (repeatedMatches.length > 0) {
        const details = repeatedMatches.slice(0, 5); // Show first 5 repeated words
        if (repeatedMatches.length > 5) details.push(`... and ${repeatedMatches.length - 5} more`);
        items.push({ type: 'repeated', count: repeatedMatches.length, label: 'Repeated Words', details });
      }
    }
    
    return items;
  }, [input, opts, invCounts]);

  // Check if boxes should be active (have meaningful values)
  const lengthActive = input.length > 0;
  const removedActive = removedChars > 0;
  const typesActive = removedItems.length > 0;

  return (
    <div className="space-y-3 mt-2">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Metric 
          k="Length (in → out)" 
          v={`${input.length} → ${output.length}`} 
          isActive={lengthActive}
        />
        <Metric 
          k="Removed (chars)" 
          v={`${removedChars}`} 
          isActive={removedActive}
        />
        <Metric 
          k="Removed Types" 
          v={`${removedItems.length}`} 
          isActive={typesActive}
        />
      </div>
      
      {/* Detailed Removal Breakdown */}
      {removedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">What was removed:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {removedItems.map((item, index) => (
              <RemovedItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}
      
      {/* Invisible Character Details */}
      {opts.removeInvisible && (invCounts.zwsp > 0 || invCounts.wj > 0 || invCounts.zwnj > 0 || invCounts.zwj > 0 || invCounts.shy > 0 || invCounts.ltrRtl > 0 || invCounts.bom > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">Invisible characters:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {invCounts.zwsp > 0 && <Metric k="ZWSP" v={`${invCounts.zwsp}`} />}
            {invCounts.wj > 0 && <Metric k="WJ" v={`${invCounts.wj}`} />}
            {invCounts.zwnj > 0 && <Metric k="ZWNJ" v={`${invCounts.zwnj}`} />}
            {invCounts.zwj > 0 && <Metric k="ZWJ" v={`${invCounts.zwj}`} />}
            {invCounts.shy > 0 && <Metric k="SHY" v={`${invCounts.shy}`} />}
            {invCounts.vs16 > 0 && <Metric k="VS16" v={`${invCounts.vs16}`} />}
            {invCounts.ltrRtl > 0 && <Metric k="LRM/RLM/ALM" v={`${invCounts.ltrRtl}`} />}
            {invCounts.bom > 0 && <Metric k="BOM/FEFF" v={`${invCounts.bom}`} />}
          </div>
        </div>
      )}
      
      {/* No changes message */}
      {removedItems.length === 0 && removedChars === 0 && input.length > 0 && (
        <div className="text-center py-4 text-neutral-400">
          <div className="text-2xl mb-2">✨</div>
          <div className="text-sm">No changes needed - your text is already clean!</div>
        </div>
      )}
    </div>
  );
}

function Metric({ k, v, isActive = false }: MetricProps) {
  const getActiveClasses = () => {
    if (!isActive) return 'bg-neutral-900 border-neutral-800';
    
    // Determine color based on metric type
    if (k.includes('Length')) {
      return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    } else if (k.includes('Removed (chars)')) {
      return 'bg-red-500/20 border-red-500/30 text-red-300';
    } else if (k.includes('Removed Types')) {
      return 'bg-green-500/20 border-green-500/30 text-green-300';
    }
    return 'bg-neutral-900 border-neutral-800';
  };

  return (
    <div className={`rounded-xl border p-3 transition-all duration-300 ${getActiveClasses()}`}>
      <div className={`text-[11px] uppercase tracking-wider ${isActive ? 'text-current/80' : 'text-neutral-400'}`}>{k}</div>
      <div className={`text-base font-medium ${isActive ? 'text-current' : ''}`}>{v}</div>
    </div>
  );
}

interface RemovedItemProps {
  item: {
    type: string;
    count: number;
    label: string;
    details?: string[];
  };
}

function RemovedItem({ item }: RemovedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getColorClasses = (type: string) => {
    switch (type) {
      case 'invisible':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      case 'markdown':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'formatting':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'code':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
      case 'urls':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'emails':
        return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300';
      case 'phones':
        return 'bg-pink-500/20 border-pink-500/30 text-pink-300';
      case 'timestamps':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'special':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'repeated':
        return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300';
      default:
        return 'bg-neutral-500/20 border-neutral-500/30 text-neutral-300';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invisible':
        return '👻';
      case 'markdown':
        return '📝';
      case 'formatting':
        return '🎨';
      case 'code':
        return '💻';
      case 'urls':
        return '🔗';
      case 'emails':
        return '📧';
      case 'phones':
        return '📞';
      case 'timestamps':
        return '⏰';
      case 'special':
        return '⚠️';
      case 'repeated':
        return '🔄';
      default:
        return '🗑️';
    }
  };

  return (
    <div className={`rounded-xl border p-3 ${getColorClasses(item.type)} cursor-pointer hover:opacity-80 transition-opacity`}
         onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon(item.type)}</span>
        <div className="flex-1">
          <div className="text-sm font-medium">{item.label}</div>
          <div className="text-xs opacity-75">{item.count} {item.count === 1 ? 'item' : 'items'} removed</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold">{item.count}</div>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && item.details && item.details.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-xs font-medium mb-2 opacity-90">Details:</div>
          <div className="space-y-1">
            {item.details.map((detail, index) => (
              <div key={index} className="text-xs opacity-75 bg-black/10 rounded px-2 py-1 font-mono">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Cleaning Logic ---
function cleanText(text: string, opts: CleanOptions): string {
  let t = text;

  // Protect ZWJ inside emoji sequences, so we can strip stray ZWJ elsewhere without breaking emoji
  const SENTINEL_ZWJ = ""; // private-use marker
  if (opts.preserveEmoji) {
    try {
      const EP = "\\p{Extended_Pictographic}";
      const reZWJ = new RegExp(`(${EP})\u200D(${EP})`, "gu");
      t = t.replace(reZWJ, `$1${SENTINEL_ZWJ}$2`);
    } catch {
      // Fallback: only match actual emoji sequences with ZWJ
      t = t.replace(/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\u200D([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/gu, `$1${SENTINEL_ZWJ}$2`);
    }
  }

  if (opts.removeInvisible) {
    // Remove Unicode Format characters (Cf): ZWSP/ZWJ/ZWNJ/WJ/bidi/etc.
    try {
      t = t.replace(/\p{Cf}/gu, "");
    } catch {
      // Fallback explicit ranges if \p{Cf} unsupported
      t = t.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\uFFF9-\uFFFB]/gu, "");
    }
    // Remove CGJ explicitly (Mn)
    t = t.replace(/\u034F/gu, "");

    // Variation selectors
    if (!opts.keepVS16Emoji) {
      t = t.replace(/[\uFE00-\uFE0F]/gu, "");
    } else {
      t = t.replace(/[\uFE00-\uFE0E]/gu, "");
    }
    t = t.replace(/[\u{E0100}-\u{E01EF}]/gu, "");
    
    // After the supplementary variation selectors removal:
    t = t.replace(/[\u{E0000}-\u{E007F}]/gu, ""); // Plane-14 TAG characters
  }

  if (opts.stripMarkdownHeaders) {
    t = t.replace(/^\s{0,3}(#{1,6})\s+/gmu, "");
  }

  if (opts.stripBoldItalic) {
    // Bold/italic markers; keep inner text
    t = t.replace(/\*\*(.*?)\*\*/gmsu, "$1");
    t = t.replace(/__(.*?)__/gmsu, "$1");
    t = t.replace(/(?<!\*)\*(?!\*)(.*?)\*(?<!\*)/gmsu, "$1");
    t = t.replace(/(?<!_)_(?!_)(.*?)_(?<!_)/gmsu, "$1");
    t = t.replace(/~~(.*?)~~/gmsu, "$1");
  }

  if (opts.stripBackticks) {
    // Fenced blocks: remove the backticks but keep content
    t = t.replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gmu, "$1\n");
    // Inline backticks
    t = t.replace(/`([^`]+)`/gmu, "$1");
  }

  if (opts.stripEmDashSeparators) {
    // Remove lines that are just separators of dashes/em-dashes
    t = t.replace(/^\s*[—–-]{2,}\s*$/gmu, "");
    // Remove standalone em-dash separator lines between paragraphs
    t = t.replace(/\n\s*[—–]\s*\n/gmu, "\n\n");
  }

  if (opts.stripListMarkers) {
    t = t.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu, "");
  }

  if (opts.stripBlockquotes) {
    t = t.replace(/^\s{0,3}>\s?/gmu, "");
  }

  if (opts.normalizeWhitespace) {
    // Inside normalizeWhitespace:
    t = t.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " "); // all Zs spaces → ASCII space
    // Collapse 2+ spaces to 1 (but not across newlines)
    t = t.replace(/(\S) {2,}(?=\S)/g, "$1 ");
    // Trim trailing spaces
    t = t.replace(/[ \t]+$/gmu, "");
  }

  if (opts.collapseBlankLines) {
    t = t.replace(/\n{3,}/g, "\n\n");
  }

  // Additional cleaning options
  if (opts.removeUrls) {
    t = t.replace(/https?:\/\/[^\s]+/g, "");
    t = t.replace(/www\.[^\s]+/g, "");
  }

  if (opts.removeEmailAddresses) {
    t = t.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "");
  }

  if (opts.removePhoneNumbers) {
    t = t.replace(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, "");
  }

  if (opts.removeTimestamps) {
    t = t.replace(/\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?\b/g, "");
    t = t.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "");
    t = t.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
  }

  if (opts.removeSpecialCharacters) {
    // Only remove truly special characters, preserve basic punctuation
    t = t.replace(/[!@#$%^&*_+=\[\]{}|\\:"'<>~`]/g, "");
  }

  if (opts.removeExtraPunctuation) {
    t = t.replace(/\.{2,}/g, ".");
    t = t.replace(/,{2,}/g, ",");
    t = t.replace(/!{2,}/g, "!");
    t = t.replace(/\?{2,}/g, "?");
  }

  if (opts.removeRepeatedWords) {
    t = t.replace(/\b(\w+)\s+\1\b/g, "$1");
  }

  if (opts.removeEmptyLines) {
    t = t.replace(/^\s*$/gm, "");
  }

  if (opts.removeTrailingSpaces) {
    t = t.replace(/[ \t]+$/gm, "");
  }

  if (opts.removeLeadingSpaces) {
    t = t.replace(/^[ \t]+/gm, "");
  }

  // Restore protected emoji joiners
  if (opts.preserveEmoji) {
    t = t.replace(//gu, "‍");
  }

  return t;
}

function countInvisibles(text: string, opts: CleanOptions) {
  const c = {
    zwsp: 0,
    wj: 0,
    zwnj: 0,
    zwj: 0,
    shy: 0,
    vs16: 0,
    ltrRtl: 0,
    bom: 0,
  };
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    
    if (cp === 0x200B) c.zwsp++;
    else if (cp === 0x2060) c.wj++;
    else if (cp === 0x200C) c.zwnj++;
    else if (cp === 0x200D) c.zwj++;
    else if (cp === 0x00AD) c.shy++;
    else if (cp === 0xFE0F) c.vs16++;
    else if (cp === 0x200E || cp === 0x200F || cp === 0x061C) c.ltrRtl++;
    else if (cp === 0xFEFF) c.bom++;
  }
  return c;
}
